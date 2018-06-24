from flask import Blueprint, redirect, request, jsonify
from functools import reduce

from .promotions_data import promotions

bp = Blueprint('dashboard', __name__)


def records_to_dict(df):
    return [
        dict([
            (colname, row[i])
            for i, colname in enumerate(df.columns)
        ])
        for row in df.values
    ]


@bp.route('/')
def index():
    return redirect('/dashboard', code=302)


@bp.route('/api/v1.0/promotions', methods=['POST'])
def get_promotion_data():
    offset = 0
    limit = 10
    sort_by = 'Category'
    sort_ascending = True
    filters = []

    if request.method == 'POST' and request.is_json:
        json = request.get_json()
        offset = json['offset']
        limit = json['limit']
        sort_by = json['sortBy']
        sort_ascending = json['sortAscending']
        filters = {k: v for k, v in json['filters'].items() if v}

    records = promotions
    if len(filters) > 0:
        records = records[reduce(
            lambda a, b: (a & b),
            [(promotions[filter] == value) for filter, value in filters.items()]
        )]

    records = (
        records
        .sort_values(by=sort_by, ascending=sort_ascending)
        .iloc[offset:(offset+limit)]
    )
    return jsonify(promotions=records_to_dict(records))


@bp.route('/api/v1.0/promotions/filters', methods=['GET'])
def get_promotion_filters():
    return jsonify(
        filters={
            'Promotion Type': promotions['Promotion Type'].unique().tolist(),
            'Item': promotions['Item'].unique().tolist(),
            'Category': promotions['Category'].unique().tolist(),
        }
    )
