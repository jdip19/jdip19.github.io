#include <windows.h>
#include <vector>
#include <string>

std::vector<std::wstring> getSelectedFiles()
{
    std::vector<std::wstring> files;

    if (!OpenClipboard(NULL))
        return files;

    HANDLE hData = GetClipboardData(CF_HDROP);
    if (!hData)
    {
        CloseClipboard();
        return files;
    }

    HDROP hDrop = (HDROP)GlobalLock(hData);
    if (!hDrop)
    {
        CloseClipboard();
        return files;
    }

    UINT count = DragQueryFileW(hDrop, 0xFFFFFFFF, NULL, 0);
    for (UINT i = 0; i < count; i++)
    {
        wchar_t path[MAX_PATH];
        DragQueryFileW(hDrop, i, path, MAX_PATH);
        files.push_back(path);
    }

    GlobalUnlock(hData);
    CloseClipboard();

    return files;
}
