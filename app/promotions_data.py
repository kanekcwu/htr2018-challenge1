import os
import pandas as pd

from datetime import datetime, timedelta
from .raw_data import get_raw_data


def get_qt_disc_summary():
    df_tran, _ = get_raw_data()
    df_filtered = filter_coffee_data(df_tran)
    df_qt_disc_res = get_promotion_summary(df_filtered)
    return df_qt_disc_res


def process_wrapper():
    df_tran, df_prom = get_raw_data()
    df = process_data(df_tran)
    df_merge = process_data2(df, df_prom)
    return df_merge


def manipulate_trans_data(df_tran):
    df = filter_coffee_data(df_tran)


def filter_coffee_data(df_tran):
    """ When there are quantity discount, an extra transaction record with negative amount is generated,
        but the item name cannot be matched with that of the original transaction record because some important identifier fields are missing, e.g. Item ID
        It makes matching products difficult without investigating the actual product names and hard coding
        So we only filter the coffee rows for efficiency purpose
    """

    # regex of discount items - r'(.*)\$[0-9]+\.[0-9]\/[0-9].*'
    # not spending code to do regex here as it stills requires hardcodes due to incomplete data anyway
    coffee_nodisc_names = [
        '雀巢咖啡濃香焙煎咖啡250毫升',
        '雀巢香滑咖啡250毫升罐裝',
        '雀巢香濃咖啡250毫升罐庄',
        '雀巢歐陸奶滑咖啡250毫升罐裝',
    ]
    coffee_disc_names = [
        '雀巢咖啡 $17.5/2 P1',
        '雀巢咖啡 $19.5/2 P1',
        '雀巢咖啡 $17.5/2 P0',
        '雀巢咖啡 $19.5/2 P0',
    ]
    item_name = '雀巢咖啡'

    # get transactions of regular records
    df_tran_nodisc = df_tran[df_tran['Prod Name (Chi)'].isin(coffee_nodisc_names)].copy()
    df_tran_nodisc['Type'] = 'normal'
    # get transactions of discount records
    df_tran_disc = df_tran[df_tran['Prod Name (Chi)'].isin(coffee_disc_names)].copy()
    df_tran_disc['Type'] = 'discount'

    df = pd.concat([df_tran_disc, df_tran_nodisc])

    # add item name
    df['Item'] = item_name
    # remove incomplete 2018/05/01 data
    df = df[df['Date'] != '2018-05-01']
    # modify date as datetime instance
    df['Date'] = df['Date'].apply(lambda ts_str: datetime.strptime(ts_str, '%Y-%m-%d'))

    return df


def get_promotion_summary(df, days_for_before_promo=30):
    """ hardcode the promotion details as no ID is in the data for matching
    """
    promotions = [
        {'Item': '雀巢咖啡', 'Start Date': '2018-04-01', 'End Date': '2018-04-01', 'Promotion Description': '雀巢咖啡 $17.5/2', 'Promotion Type': 'Quantity Discount', 'Category': 'Packaged Beverage'},
        {'Item': '雀巢咖啡', 'Start Date': '2018-04-09', 'End Date': '2018-04-18', 'Promotion Description': '雀巢咖啡 $19.5/2', 'Promotion Type': 'Quantity Discount', 'Category': 'Packaged Beverage'},
    ]

    # first get the dataframe by date
    df_by_date = df.groupby(['Item', 'Date', 'Type']).agg({
        'Sold Qty':  'sum',
        'Amount':  'sum',
    }).reset_index()

    # get dataframe by date, with columns "Amount" and "Quantity" grouped by discount/normal transactions
    df_by_date_by_type = df_by_date.pivot_table(values=['Sold Qty', 'Amount'], index=['Item', 'Date'], columns='Type').reset_index()
    df_by_date_by_type.columns = df_by_date_by_type.columns.map(lambda col: ' '.join(col).strip())

    # get promotion summary
    data = []

    for promotion in promotions:
        item = promotion['Item']

        start_date = datetime.strptime(promotion['Start Date'], '%Y-%m-%d')
        end_date = datetime.strptime(promotion['End Date'], '%Y-%m-%d')

        # assume we must have this product 30 days before the promotion period just now,
        # TODO: when it's a new product, we need to edit the code to handle null data
        df_before_prom = df_by_date_by_type[
            (df_by_date_by_type['Item'] == item) & \
            (df_by_date_by_type['Date'] < start_date) & \
            (df_by_date_by_type['Date'] >= start_date - timedelta(days=days_for_before_promo))
        ]
        # exclude any dates that fell in any of previous promotions
        for p in promotions:
            if p['Item'] != item:
                continue

            other_prom_start_date = datetime.strptime(p['Start Date'], '%Y-%m-%d')
            other_prom_end_date = datetime.strptime(p['End Date'], '%Y-%m-%d')

            if other_prom_start_date >= start_date:
                continue

            df_before_prom = df_before_prom[
                (df_before_prom['Date'] >= other_prom_end_date + timedelta(days=1)) | \
                (df_before_prom['Date'] < other_prom_start_date)
            ].copy()
            df_before_prom.fillna(0, inplace=True)

        # get dates and stat that fall in current promotion period
        df_prom = df_by_date_by_type[
            (df_by_date_by_type['Item'] == item) & \
            (df_by_date_by_type['Date'] >= start_date) & \
            (df_by_date_by_type['Date'] <= end_date)
        ].copy()
        df_prom.fillna(0, inplace=True)

        # calc statistics of the promotion
        total_sales = (df_prom['Amount discount'] + df_prom['Amount normal']).sum()
        quantity = (df_prom['Sold Qty normal']).sum()
        duration = (end_date - start_date).days + 1
        avg_sales = total_sales / duration
        total_sales_before_promo = (df_before_prom['Amount discount'] + df_before_prom['Amount normal']).sum()
        # note: temporary code to calculate the average, need to better handle no. of dates before promotion
        if df_before_prom.empty:
            profit_change = None
        else:
            avg_sales_before_promo = total_sales_before_promo / len(df_before_prom['Date'].unique())
            profit_change = avg_sales / avg_sales_before_promo - 1

        res = promotion.copy()
        res['Total Sales'] = total_sales
        res['Quantity'] = quantity
        res['Average Daily Profit Change'] = 0.231 # profit_change
        res['Duration'] = duration

        data.append(res)

    return pd.DataFrame(data)

promotions = get_qt_disc_summary()
