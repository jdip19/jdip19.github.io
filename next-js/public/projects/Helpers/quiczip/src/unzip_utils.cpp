#include "unzip_utils.h"
#include "miniz.h"
#include <string>

void unzipFiles(const std::vector<std::wstring>& files) {
    for (auto &file : files) {
        mz_zip_archive zip = {};
        std::string fname(file.begin(), file.end());
        mz_zip_reader_init_file(&zip, fname.c_str(), 0);
        mz_zip_reader_extract_all(&zip, ".");
        mz_zip_reader_end(&zip);
    }
}
