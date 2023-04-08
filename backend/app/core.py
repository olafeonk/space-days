from datetime import date, timedelta

def dateFromYdbDate(ydbDate):
    return date(1970, 1, 1) + timedelta(days=ydbDate)

def strFromDate(d: date):
    return d.isoformat()

def dateFromStr(s: str):
    return date.fromisoformat(s)