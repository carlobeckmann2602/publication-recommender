import numpy as np
import pandas as pd


def add_array_column(dataframe: pd.DataFrame, column_name: str, value_array: np.ndarray) -> pd.DataFrame:
    """Overrides or adds a column with array-like values to the dataframe.
    Data should be specified like [[cir1_val, cir1_val, ...], [cir2_val, cir2_val, ...], ...]

    :param dataframe: The dataframe to be edited
    :param column_name: The name of the new column. If column already exists it will be overwritten
    :param value_array: The data for the new Column in 2D Array
    :return: The dataframe with the new data
    """
    dataframe = dataframe.copy()
    if value_array.ndim > 1:
        dataframe.reset_index(inplace=True, drop=True)
        value_list = value_array.tolist()
        value_series = pd.Series(value_list)
        dataframe[column_name] = value_series
    else:
        dataframe[column_name] = value_array
    return dataframe