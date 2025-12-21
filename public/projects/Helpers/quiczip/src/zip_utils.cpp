#include "zip_utils.h"
#include "miniz.h"
#include <filesystem>

void zipFiles(const std::vector<std::wstring>& files) {
    std::wstring output = L"archive.zip";

    mz_zip_archive zip = {};
    mz_zip_writer_init_file(&zip, std::string(output.begin(), output.end()).c_str(), 0);

    for (auto &file : files) {
        auto path = std::filesystem::path(file);
        mz_zip_writer_add_file(&zip,
            path.filename().string().c_str(),
            std::string(file.begin(), file.end()).c_str(),
            NULL, 0, MZ_BEST_COMPRESSION);
    }

    mz_zip_writer_finalize_archive(&zip);
    mz_zip_writer_end(&zip);
}
