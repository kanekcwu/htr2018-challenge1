import pandas as pd
import os


def get_raw_data():
    current_file = os.path.abspath(os.path.dirname(__file__))
    return (
        pd.read_csv(os.path.join(current_file, './data/data_dictionary.csv')),
        pd.read_csv(os.path.join(current_file, './data/transactions.csv')),
        pd.read_csv(os.path.join(current_file, './data/promotions.csv')),
    )


data_definitions, transactions, promotions = get_raw_data()
