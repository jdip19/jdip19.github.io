cmake_minimum_required(VERSION 3.10)
project(quiczip)

set(CMAKE_CXX_STANDARD 17)
include_directories(include)

# Resource compiler include fix
set(CMAKE_RC_FLAGS "${CMAKE_RC_FLAGS} -I\"${CMAKE_CURRENT_SOURCE_DIR}/include\"")

add_executable(Quiczip WIN32
    src/quiczip.cpp
    src/file_selection.cpp
    src/miniz.c
    src/miniz_tdef.c
    src/miniz_tinfl.c
    src/miniz_zip.c
    resources/app.rc
)

target_link_libraries(Quiczip shlwapi)
set(CMAKE_WIN32_EXECUTABLE TRUE)
