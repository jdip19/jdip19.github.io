# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file LICENSE.rst or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION ${CMAKE_VERSION}) # this file comes with cmake

# If CMAKE_DISABLE_SOURCE_CHANGES is set to true and the source directory is an
# existing directory in our source tree, calling file(MAKE_DIRECTORY) on it
# would cause a fatal error, even though it would be a no-op.
if(NOT EXISTS "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-src")
  file(MAKE_DIRECTORY "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-src")
endif()
file(MAKE_DIRECTORY
  "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-build"
  "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-subbuild/webp-populate-prefix"
  "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-subbuild/webp-populate-prefix/tmp"
  "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-subbuild/webp-populate-prefix/src/webp-populate-stamp"
  "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-subbuild/webp-populate-prefix/src"
  "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-subbuild/webp-populate-prefix/src/webp-populate-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-subbuild/webp-populate-prefix/src/webp-populate-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "D:/Jaydip-Upadhyay/jdip19.github.io/projects/quiczip/build/_deps/webp-subbuild/webp-populate-prefix/src/webp-populate-stamp${cfgdir}") # cfgdir has leading slash
endif()
