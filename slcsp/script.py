import pandas as pd
import numpy as np

'''
This script determines the second-lowest silver plan per zip code by
(1) calculating second-lowest silver plan per (state, rate_area),
(2) and mapping zip codes to (state, rate_area).

In order words, zipcode -> (state, rate_area) -> SLCSP. Results are
outputted to result.csv

Some zip codes may not have a corresponding SLCSP. This is because of
(1) a zip code that links to multiple (state, rate_area)
(2) or <2 silver plans in a (state, rate_area)
(3) or <2 unique price poitns for silver plans in a (state, rate_area).
'''

# plans.csv
# filter down to silver plans only
plans = pd.read_csv('plans.csv')
silver_plans = plans[plans['metal_level'] == 'Silver']

# get unique price points per (state, rate_area)
silver_groups = silver_plans.groupby(['state', 'rate_area'])
unique_costs = silver_groups['rate'].unique()

# filter out (state, rate_area) with <2 silver plans
has_at_least_two = unique_costs.map(lambda x: x.size >= 2)
unique_costs = unique_costs[has_at_least_two]

# get second-lowest plan from (state, rate_area) pairs
get_second_lowest = lambda x: np.partition(x, 1)[1]
second_lowest = unique_costs.map(get_second_lowest)

# zips.csv
# get rid of zip codes that correspond to more than one area
zips = pd.read_csv('zips.csv')
zips.drop_duplicates(['zipcode'], keep=False, inplace=True)

'''
map zipcodes to (state, rate_area)

second_lowest is converted to a DataFrame to conform with
pandas.DataFrame.merge() signature
'''
alpha = zips.merge(
    pd.DataFrame(second_lowest),
    how='inner',
    left_on=['state', 'rate_area'],
    right_index=True
)


# map zip codes to second-lowest-cost-silver-plan
slcsp = pd.read_csv('slcsp.csv')
result = slcsp.merge(
    alpha,
    how='left',
    on='zipcode'
)

# clean data up, then output result to csv
result = result.filter(['zipcode', 'rate_y'], )
result.rename(columns={'rate_y': 'rate'}, inplace=True)
result.to_csv('result.csv', index=False)
