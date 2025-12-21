#include <windows.h>
#include <shlobj.h>
#include <shldisp.h>
#include <exdisp.h>
#include <exdispid.h>
#include <vector>
#include <string>

std::vector<std::string> GetSelectedFiles()
{
    std::vector<std::string> results;

    CoInitialize(nullptr);

    IShellWindows* pShellWindows = nullptr;
    HRESULT hr = CoCreateInstance(CLSID_ShellWindows, NULL, CLSCTX_ALL,
                                  IID_IShellWindows, (void**)&pShellWindows);
    if (FAILED(hr) || !pShellWindows)
    {
        CoUninitialize();
        return results;
    }

    long count = 0;
    pShellWindows->get_Count(&count);

    for (long i = 0; i < count; i++)
    {
        VARIANT index;
        VariantInit(&index);
        index.vt = VT_I4;
        index.lVal = i;

        IDispatch* pDisp = nullptr;
        if (FAILED(pShellWindows->Item(index, &pDisp)) || !pDisp)
            continue;

        IWebBrowserApp* pBrowser = nullptr;
        hr = pDisp->QueryInterface(IID_IWebBrowserApp, (void**)&pBrowser);
        pDisp->Release();
        if (FAILED(hr) || !pBrowser)
            continue;

        IDispatch* pDoc = nullptr;
        hr = pBrowser->get_Document(&pDoc);
        if (FAILED(hr) || !pDoc)
        {
            pBrowser->Release();
            continue;
        }

        IShellFolderViewDual* pView = nullptr;
        hr = pDoc->QueryInterface(IID_IShellFolderViewDual, (void**)&pView);
        pDoc->Release();
        if (FAILED(hr) || !pView)
        {
            pBrowser->Release();
            continue;
        }

        FolderItems* pItems = nullptr;
        hr = pView->SelectedItems(&pItems); 
        if (FAILED(hr) || !pItems)
        {
            pView->Release();
            pBrowser->Release();
            continue;
        }

        long itemCount = 0;
        pItems->get_Count(&itemCount);

        for (long j = 0; j < itemCount; j++)
        {
            VARIANT idx;
            VariantInit(&idx);
            idx.vt = VT_I4;
            idx.lVal = j;

            FolderItem* pItem = nullptr;
            hr = pItems->Item(idx, &pItem);
            if (SUCCEEDED(hr) && pItem)
            {
                BSTR bstrPath;
                if (SUCCEEDED(pItem->get_Path(&bstrPath)))
                {
                    char buffer[MAX_PATH];
                    WideCharToMultiByte(CP_UTF8, 0, bstrPath, -1,
                                        buffer, MAX_PATH, NULL, NULL);
                    results.emplace_back(buffer);
                    SysFreeString(bstrPath);
                }
                pItem->Release();
            }
        }

        pItems->Release();
        pView->Release();
        pBrowser->Release();
    }

    pShellWindows->Release();
    CoUninitialize();

    return results;
}
