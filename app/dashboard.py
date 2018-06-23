from flask import Blueprint, redirect, request, jsonify
from .data import promotions

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
    return redirect("/dashboard", code=302)


@bp.route('/api/v1.0/promotions', methods=['GET'])
def get_sale_data():
    offset = request.args.get('offset', 0, int)
    limit = request.args.get('limit', 10, int)
    sort_by = request.args.get('sortBy', 'Prom End', str)
    sort_ascending = request.args.get('sortAscending', 0, int) == 1

    records = (
        promotions
        .sort_values(by=sort_by, ascending=sort_ascending)
        .iloc[offset:(offset+limit)]
    )
    return jsonify(promotions=records_to_dict(records))
