#include "miniz.h"
#include "file_selection.h"
#include <windows.h>
#include <iostream>
#include <vector>
#include <string>
#include <filesystem>
#define IDI_APP_ICON 

namespace fs = std::filesystem;
HWND g_hWnd;



void ShowTrayMessage(HWND hWnd, const char* title, const char* message)
{
    NOTIFYICONDATA nid = {};
    nid.cbSize = sizeof(NOTIFYICONDATA);
    nid.hWnd = hWnd;
    nid.uID = 1;

    // Show icon + balloon
    nid.uFlags = NIF_INFO | NIF_ICON | NIF_MESSAGE | NIF_TIP;

    // Load your icon from resources (same as EXE icon)
    nid.hIcon = LoadIcon(GetModuleHandle(NULL), MAKEINTRESOURCE(IDI_APP_ICON));

    // Tooltip (optional)
    strcpy_s(nid.szTip, "QuickZip");

    // Balloon title + message
    strcpy_s(nid.szInfoTitle, title);
    strcpy_s(nid.szInfo, message);
    nid.dwInfoFlags = NIIF_INFO;

    // Timeout (2 seconds)
    nid.uTimeout = 2000; // milliseconds

    // Add + modify notification
    Shell_NotifyIcon(NIM_ADD, &nid);
    Shell_NotifyIcon(NIM_MODIFY, &nid);
}


//
// ---------------- ZIP LOGIC ----------------
//
bool ZipFiles(const std::vector<std::string>& inputs, const std::string& outputZip)
{
    mz_zip_archive zip;
    memset(&zip, 0, sizeof(zip));

    if (!mz_zip_writer_init_file(&zip, outputZip.c_str(), 0))
        return false;

    for (const auto& pathStr : inputs)
    {
        fs::path p(pathStr);

        if (fs::is_regular_file(p))
        {
            // Add single file
            if (!mz_zip_writer_add_file(&zip,
                p.filename().string().c_str(),
                p.string().c_str(),
                nullptr, 0, MZ_BEST_COMPRESSION))
            {
                mz_zip_writer_end(&zip);
                return false;
            }
        }
        else if (fs::is_directory(p))
        {
            // Recursively add all files inside the directory
            for (auto& entry : fs::recursive_directory_iterator(p))
            {
                if (!entry.is_regular_file())
                    continue;

                fs::path fullPath = entry.path();
                fs::path relative = fs::relative(fullPath, p);

                std::string zipPath = (p.filename() / relative).string();

                if (!mz_zip_writer_add_file(&zip,
                    zipPath.c_str(),
                    fullPath.string().c_str(),
                    nullptr, 0, MZ_BEST_COMPRESSION))
                {
                    mz_zip_writer_end(&zip);
                    return false;
                }
            }
        }
    }

    mz_zip_writer_finalize_archive(&zip);
    mz_zip_writer_end(&zip);
    return true;
}

//
// ---------------- UNZIP LOGIC ----------------
//
bool UnzipToFolder(const std::string& zipPath, const std::string& destDir)
{
    mz_zip_archive zip;
    memset(&zip, 0, sizeof(zip));

    if (!mz_zip_reader_init_file(&zip, zipPath.c_str(), 0))
        return false;

    mz_uint num_files = mz_zip_reader_get_num_files(&zip);
    for (mz_uint i = 0; i < num_files; i++)
    {
        mz_zip_archive_file_stat stat;
        if (!mz_zip_reader_file_stat(&zip, i, &stat))
            continue;

        fs::path outPath = fs::path(destDir) / stat.m_filename;

        if (stat.m_is_directory)
        {
            fs::create_directories(outPath);
            continue;
        }

        fs::create_directories(outPath.parent_path());

        if (!mz_zip_reader_extract_to_file(&zip, i, outPath.string().c_str(), 0))
        {
            mz_zip_reader_end(&zip);
            return false;
        }
    }

    mz_zip_reader_end(&zip);
    return true;
}


//
// ---------------- MAIN HANDLER LOGIC ----------------
//
void ProcessSelection()
{
    CoInitialize(nullptr);
    auto files = GetSelectedFiles();
    CoUninitialize();
    
    if (files.empty())
    {
        MessageBox(nullptr, "No file selected.", "Quiczip", MB_OK);
        return;
    }

    // Check if UNZIP case
    bool containsZip = false;
    std::string zipFile;

    for (auto& f : files)
    {
        std::string ext = fs::path(f).extension().string();
        for (auto& c : ext) c = tolower(c);

        if (ext == ".zip")
        {
            containsZip = true;
            zipFile = f;
            break;
        }
    }

    if (containsZip)
    {
        // UNZIP
        std::string folderName = zipFile.substr(0, zipFile.size() - 4);
        if (UnzipToFolder(zipFile, folderName))
        {
            MessageBox(nullptr, "Unzip completed!", "Quiczip", MB_OK);
        }
        else
        {
            MessageBox(nullptr, "Unzip failed!", "Quiczip", MB_OK);
        }
        return;
    }

    // ZIP CASE
    if (files.size() == 1)
    {
        fs::path file = files[0];
        fs::path dir  = file.parent_path();
        std::string base = file.stem().string();

        fs::path out = dir / (base + ".zip");

        if (ZipFiles(files, out.string()))
            MessageBox(nullptr, "Zip created!", "Quiczip", MB_OK);
        else
            MessageBox(nullptr, "Zip failed!", "Quiczip", MB_OK);
    }
    else
    {
        fs::path firstPath = files[0];
        fs::path dir      = firstPath.parent_path();          // same folder
        std::string base  = firstPath.stem().string();        // filename without extension

        fs::path out = dir / (base + ".zip");                 // final zip path

        if (ZipFiles(files, out.string()))
            MessageBox(nullptr, "Zip created!", "Quiczip", MB_OK);
        else
            MessageBox(nullptr, "Zip failed!", "Quiczip", MB_OK);
    }
}

//
// ---------------- HOTKEY LISTENER ----------------
//
int main()
{
    RegisterHotKey(nullptr, 1, MOD_CONTROL | MOD_ALT, 'Z');

    ShowTrayMessage(GetConsoleWindow(), "Quiczip", "Press CTRL + ALT + Z to zip/unzip.");


    MSG msg = {0};

    while (GetMessage(&msg, nullptr, 0, 0))
    {
        if (msg.message == WM_HOTKEY)
        {
            ProcessSelection();
        }
    }

    return 0;
}
