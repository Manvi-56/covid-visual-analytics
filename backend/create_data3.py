import pandas as pd

# Load your COVID CSV
df = pd.read_csv("state_level_latest.csv")

# Define population of all 36 Indian states/UTs (2021 estimates, feel free to update)
# Values are approximate; you can adjust
state_pop = {
    "Andhra Pradesh": 53903393,
    "Arunachal Pradesh": 1570458,
    "Assam": 35607039,
    "Bihar": 124799926,
    "Chhattisgarh": 29436231,
    "Goa": 1569923,
    "Gujarat": 63872399,
    "Haryana": 28672000,
    "Himachal Pradesh": 7400000,
    "Jharkhand": 38593948,
    "Karnataka": 67562686,
    "Kerala": 35699443,
    "Madhya Pradesh": 85358965,
    "Maharashtra": 123144223,
    "Manipur": 3091545,
    "Meghalaya": 3366710,
    "Mizoram": 1239244,  # MISSING
    "Nagaland": 2249695,
    "Odisha": 46356334,   # MISSING
    "Punjab": 30141373,
    "Rajasthan": 81032689,
    "Sikkim": 690251,
    "Tamil Nadu": 77841267,
    "Telangana": 39362732,
    "Tripura": 4169794,
    "Uttar Pradesh": 241066874,
    "Uttarakhand": 11250858,  # MISSING
    "West Bengal": 99609303,
    "Delhi": 19814000,
    "Jammu and Kashmir": 13606320,
    "Ladakh": 307000,
    "Puducherry": 1627603,
    "Chandigarh": 1189200,
    "Andaman and Nicobar Islands": 434000,
    "Dadra and Nagar Haveli and Daman and Diu": 837000,
    "Lakshadweep": 64473,
}

# Step 1: Add population for known states
df["Population"] = df["State"].map(state_pop)

# Separate known and missing
missing_states = ["Odisha", "Uttarakhand", "Mizoram"]
df_known = df[~df["State"].isin(missing_states)].copy()

# Step 2: Compute per capita rates for each metric
metrics = ["Confirmed", "Active", "Deaths"]
total_pop_known = df_known["Population"].sum()

per_capita = {
    metric: df_known[metric].sum() / total_pop_known
    for metric in metrics
}

# Step 3: Generate data for missing states
new_rows = []
for state in missing_states:
    pop = state_pop[state]
    row = {
        "State": state,
        "Population": pop,
    }
    for metric in metrics:
        row[metric] = int(pop * per_capita[metric])
    new_rows.append(row)

# Step 4: Combine and save
df_missing = pd.DataFrame(new_rows)
df_final = pd.concat([df_known, df_missing], ignore_index=True)
df_final = df_final[["State", "Population", "Confirmed", "Active", "Deaths"]]
df_final.to_csv("state_data.csv", index=False)

print("✅ Done. Filled file saved as covid-data-filled.csv")
