using System.Diagnostics;
using System.Reflection;
using System.Text;
using Microsoft.Win32;
using System.IO.Compression;
using System.Net.Http;

namespace Quiktool;

internal static class Program
{
	private static readonly string[] SupportedExtensions = new[]
	{
		".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".gif"
	};

	private static int Main(string[] args)
	{
		try
		{
			if (args.Length == 0)
			{
				InstallContextMenu();
				Console.WriteLine("Quiktool installed. Right-click images → Convert to WebP.");
				return 0;
			}

			var command = args[0].ToLowerInvariant();
			return command switch
			{
				"install" => InstallCommand(),
				"uninstall" => UninstallCommand(),
				"convert" => ConvertCommand(args.Skip(1).ToArray()),
				_ => ShowUsage()
			};
		}
		catch (Exception ex)
		{
			Console.Error.WriteLine($"Error: {ex.Message}");
			return 1;
		}
	}

	private static int ShowUsage()
	{
		Console.WriteLine("Usage:");
		Console.WriteLine("  quiktool           Install context menu for images (HKCU)");
		Console.WriteLine("  quiktool install   Install context menu for images (HKCU)");
		Console.WriteLine("  quiktool uninstall Remove context menu");
		Console.WriteLine("  quiktool convert <files...>  Convert selected images to WebP");
		return 0;
	}

	private static int InstallCommand()
	{
		InstallContextMenu();
		Console.WriteLine("Installed context menu: Convert to WebP");
		return 0;
	}

	private static int UninstallCommand()
	{
		UninstallContextMenu();
		Console.WriteLine("Uninstalled context menu: Convert to WebP");
		return 0;
	}

	private static void InstallContextMenu()
	{
		string exePath = GetSelfPath();
		string baseKeyPath = @"Software\\Classes\\SystemFileAssociations\\image\\shell\\Quiktool.ConvertToWebP";
		using RegistryKey? key = Registry.CurrentUser.CreateSubKey(baseKeyPath);
		if (key == null)
		{
			throw new InvalidOperationException("Unable to create registry key for context menu.");
		}

		key.SetValue("MUIVerb", "Convert to WebP", RegistryValueKind.String);
		key.SetValue("Icon", $"\"{exePath}\"", RegistryValueKind.String);
		key.SetValue("MultiSelectModel", "Document", RegistryValueKind.String);

		using RegistryKey commandKey = key.CreateSubKey("command") ?? throw new InvalidOperationException("Unable to create command subkey.");
		commandKey.SetValue(null, $"\"{exePath}\" convert %*", RegistryValueKind.String);
	}

	private static void UninstallContextMenu()
	{
		string baseKeyPath = @"Software\\Classes\\SystemFileAssociations\\image\\shell";
		using RegistryKey shellKey = Registry.CurrentUser.OpenSubKey(baseKeyPath, writable: true) ?? throw new InvalidOperationException("Context menu not found.");
		shellKey.DeleteSubKeyTree("Quiktool.ConvertToWebP", throwOnMissingSubKey: false);
	}

	private static int ConvertCommand(string[] fileArgs)
	{
		if (fileArgs.Length == 0)
		{
			Console.Error.WriteLine("No input files.");
			return 1;
		}

		string cwebpPath = ExtractBundledCwebp();
		int numConverted = 0;
		int numFailed = 0;

		foreach (string raw in fileArgs)
		{
			string filePath = Unquote(raw);
			try
			{
				if (!File.Exists(filePath))
				{
					continue;
				}

				string ext = Path.GetExtension(filePath).ToLowerInvariant();
				if (!SupportedExtensions.Contains(ext))
				{
					// allow anyway; cwebp will decide
				}

				string? dir = Path.GetDirectoryName(filePath);
				if (string.IsNullOrEmpty(dir))
				{
					continue;
				}

				string outDir = Path.Combine(dir, "webp");
				Directory.CreateDirectory(outDir);

				string nameNoExt = Path.GetFileNameWithoutExtension(filePath);
				string outPath = Path.Combine(outDir, nameNoExt + ".webp");

				bool ok = RunCwebp(cwebpPath, filePath, outPath);
				if (ok)
				{
					numConverted++;
				}
				else
				{
					numFailed++;
				}
			}
			catch
			{
				numFailed++;
			}
		}

		Console.WriteLine($"Converted: {numConverted}, Failed: {numFailed}");
		return numFailed == 0 ? 0 : 2;
	}

	private static bool RunCwebp(string cwebpPath, string inputPath, string outputPath)
	{
		var psi = new ProcessStartInfo
		{
			FileName = cwebpPath,
			Arguments = $"-q 85 -mt \"{inputPath}\" -o \"{outputPath}\"",
			UseShellExecute = false,
			RedirectStandardOutput = true,
			RedirectStandardError = true,
			CreateNoWindow = true,
			WindowStyle = ProcessWindowStyle.Hidden
		};

		using var proc = Process.Start(psi);
		if (proc == null)
		{
			return false;
		}

		StringBuilder output = new();
		proc.OutputDataReceived += (_, e) => { if (e.Data != null) output.AppendLine(e.Data); };
		proc.ErrorDataReceived += (_, e) => { if (e.Data != null) output.AppendLine(e.Data); };
		proc.BeginOutputReadLine();
		proc.BeginErrorReadLine();
		proc.WaitForExit();

		return proc.ExitCode == 0 && File.Exists(outputPath);
	}

	private static string ExtractBundledCwebp()
	{
		// 1) Prefer embedded resource if available
		string tempPath = Path.Combine(Path.GetTempPath(), "quiktool_cwebp.exe");
		using Assembly assembly = Assembly.GetExecutingAssembly();
		string? resourceName = assembly.GetManifestResourceNames()
			.FirstOrDefault(n => n.EndsWith("cwebp.exe", StringComparison.OrdinalIgnoreCase));
		if (resourceName != null)
		{
			using Stream? stream = assembly.GetManifestResourceStream(resourceName);
			if (stream == null)
			{
				throw new InvalidOperationException("Unable to read bundled cwebp.exe resource.");
			}

			bool shouldWrite = true;
			if (File.Exists(tempPath))
			{
				try
				{
					using var fs = File.OpenRead(tempPath);
					if (fs.Length == stream.Length) shouldWrite = false;
				}
				catch { /* overwrite on error */ }
			}

			if (shouldWrite)
			{
				using var outFs = File.Open(tempPath, FileMode.Create, FileAccess.Write, FileShare.Read);
				stream.CopyTo(outFs);
			}

			return tempPath;
		}

		// 2) Look for side-by-side cwebp.exe next to the EXE
		string localCwebp = Path.Combine(AppContext.BaseDirectory, "cwebp.exe");
		if (File.Exists(localCwebp))
		{
			return localCwebp;
		}

		// 3) Download and extract from official libwebp release if not present
		return DownloadAndExtractCwebp();
	}

	private static string DownloadAndExtractCwebp()
	{
		string version = "1.3.2";
		string zipUrl = $"https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-{version}-windows-x64.zip";
		string tempRoot = Path.Combine(Path.GetTempPath(), "quiktool_webp");
		Directory.CreateDirectory(tempRoot);
		string zipPath = Path.Combine(tempRoot, "libwebp.zip");
		string extractDir = Path.Combine(tempRoot, "extract");

		if (!File.Exists(zipPath))
		{
			using var http = new HttpClient();
			using var resp = http.GetAsync(zipUrl).GetAwaiter().GetResult();
			resp.EnsureSuccessStatusCode();
			using var fs = File.Create(zipPath);
			resp.Content.CopyToAsync(fs).GetAwaiter().GetResult();
		}

		if (Directory.Exists(extractDir))
		{
			try { Directory.Delete(extractDir, true); } catch { /* ignore */ }
		}
		ZipFile.ExtractToDirectory(zipPath, extractDir);

		string? cwebpPath = Directory.GetFiles(extractDir, "cwebp.exe", SearchOption.AllDirectories)
			.FirstOrDefault();
		if (cwebpPath == null)
		{
			throw new InvalidOperationException("cwebp.exe not found in downloaded package.");
		}

		string finalPath = Path.Combine(Path.GetTempPath(), "quiktool_cwebp.exe");
		File.Copy(cwebpPath, finalPath, overwrite: true);
		return finalPath;
	}

	private static string GetSelfPath()
	{
		return Environment.ProcessPath ?? Assembly.GetExecutingAssembly().Location;
	}

	private static string Unquote(string value)
	{
		if (value.Length >= 2 && value.StartsWith('"') && value.EndsWith('"'))
		{
			return value.Substring(1, value.Length - 2);
		}
		return value;
	}
}


