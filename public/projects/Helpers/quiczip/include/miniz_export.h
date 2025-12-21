#pragma once

#if defined(_WIN32)
#   if defined(MINIZ_DLL)
#       if defined(MINIZ_IMPLEMENTATION)
#           define MINIZ_EXPORT __declspec(dllexport)
#       else
#           define MINIZ_EXPORT __declspec(dllimport)
#       endif
#   else
#       define MINIZ_EXPORT
#   endif
#elif defined(__GNUC__) && defined(MINIZ_DLL)
#   define MINIZ_EXPORT __attribute__((visibility("default")))
#else
#   define MINIZ_EXPORT
#endif