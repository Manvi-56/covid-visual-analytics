import pandas as pd
import re

# Load raw dataset
df = pd.read_csv("covid_impact_on_work new.csv")

# Helper to fix malformed float strings like "6.392.393.639.805.820"
def fix_number_column(col):
    def fix(val):
        if pd.isna(val):
            return None
        val = str(val)
        # Keep only first valid float pattern
        matches = re.findall(r"\d+\.\d+", val)
        if matches:
            return float(matches[0])
        try:
            return float(val)
        except:
            return None
    return col.apply(fix)

# Columns to clean
columns_to_clean = ["Hours_Worked_Per_Day", "Meetings_Per_Day"]

# Apply fixes
for col in columns_to_clean:
    if col in df.columns:
        df[col] = fix_number_column(df[col])

# Optional: drop rows with nulls in important columns
df.dropna(subset=["Hours_Worked_Per_Day", "Meetings_Per_Day", "Productivity_Change"], inplace=True)

# Export cleaned CSV
df.to_csv("cleaned_data.csv", index=False)
print("Cleaned data saved to cleaned_covid_data.csv")
