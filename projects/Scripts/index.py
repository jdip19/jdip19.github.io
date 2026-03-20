# limit = 10
# b = limit//2

# for i in range(1, b+1):
#     row = ""
    

#     for j in range(1, i+1):
#         row += "*" 
#     print(row)

# for k in range(b, 0, -1):
#     row = ""
#     for l in range(1, k):
#         row += "*"
#     print(row)
b = 5

for i in range(1, b + 1):
    print("*" * i)

for i in range(b - 1, 0, -1):
    print("*" * i)