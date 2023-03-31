import pandas as pd


excel_data = pd.read_excel("space_days.xlsx", index_col=0, comment='#')
print(excel_data['Название меропиятия'])


