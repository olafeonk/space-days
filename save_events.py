import pandas as pd


excel_data = pd.read_excel("space_days.xlsx")

data = pd.DataFrame(excel_data, columns=['skip', "title", "summary", "description", "location", "is_for_child", "age",
                                          "logo", "time", "start_time", "durable", "amount"])

print("The content of the file is:\n", data)

