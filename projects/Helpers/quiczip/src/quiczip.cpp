#include "miniz.h"
#include "file_selection.h"
#include <windows.h>
#include <iostream>
#include <vector>
#include <string>
#include <filesystem>

namespace fs = std::filesystem;

//
// ---------------- ZIP LOGIC ----------------
//
bool ZipFiles(const std::vector<std::string>& inputs, const std::string& outputZip) 
{
    mz_zip_archive zip;
    memset(&zip, 0, sizeof(zip));

    if (!mz_zip_writer_init_file(&zip, outputZip.c_str(), 0))
        return false;

    for (const auto& file : inputs) 
    {
        if (fs::is_directory(file))
            continue;

        if (!mz_zip_writer_add_file(&zip, fs::path(file).filename().string().c_str(),
            file.c_str(), nullptr, 0, MZ_BEST_COMPRESSION))
        {
            mz_zip_writer_end(&zip);
            return false;
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
// ---------------- GET SELECTED FILES FROM EXPLORER ----------------
//
std::vector<std::string> GetSelectedFiles()
{
    std::vector<std::string> files;

    if (!OpenClipboard(nullptr))
        return files;

    HANDLE h = GetClipboardData(CF_HDROP);
    if (!h)
    {
        CloseClipboard();
        return files;
    }

    HDROP drop = (HDROP)h;

    UINT count = DragQueryFile(drop, 0xFFFFFFFF, nullptr, 0);

    for (UINT i = 0; i < count; i++)
    {
        char path[MAX_PATH];
        DragQueryFile(drop, i, path, MAX_PATH);
        files.push_back(path);
    }

    CloseClipboard();
    return files;
}

//
// ---------------- MAIN HANDLER LOGIC ----------------
//
void ProcessSelection()
{
    auto files = GetSelectedFiles();

    if (files.empty())
    {
        MessageBox(nullptr, "No file selected.", "QuickZip", MB_OK);
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
            MessageBox(nullptr, "Unzip completed!", "QuickZip", MB_OK);
        }
        else
        {
            MessageBox(nullptr, "Unzip failed!", "QuickZip", MB_OK);
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
            MessageBox(nullptr, "Zip created!", "QuickZip", MB_OK);
        else
            MessageBox(nullptr, "Zip failed!", "QuickZip", MB_OK);
    }
    else
    {
        fs::path firstPath = files[0];
        fs::path dir      = firstPath.parent_path();          // same folder
        std::string base  = firstPath.stem().string();        // filename without extension

        fs::path out = dir / (base + ".zip");                 // final zip path

        if (ZipFiles(files, out.string()))
            MessageBox(nullptr, "Zip created!", "QuickZip", MB_OK);
        else
            MessageBox(nullptr, "Zip failed!", "QuickZip", MB_OK);
    }
}

//
// ---------------- HOTKEY LISTENER ----------------
//
int main()
{
    RegisterHotKey(nullptr, 1, MOD_CONTROL | MOD_ALT, 'Z');

    MessageBox(nullptr, "QuickZip is running.\nPress CTRL + ALT + Z to zip/unzip.", "QuickZip", MB_OK);

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
