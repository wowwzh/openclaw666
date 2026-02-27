"""
Project: Time Tool v1.0
Features:
1. Get current time (different timezones)
2. DateTime formatting
3. Date calculation (add/sub days, weeks, months)
4. Unix timestamp conversion
5. Leap year check, weekday
6. Friendly time display
"""

from datetime import datetime, timedelta
import calendar


class TimeTool:
    """Time processing tool"""
    
    @staticmethod
    def now(tz='beijing'):
        """Get current time"""
        if tz.lower() in ['beijing', 'shanghai']:
            return datetime.now()
        elif tz.lower() == 'utc':
            return datetime.utcnow()
        else:
            return datetime.now()
    
    @staticmethod
    def format_time(dt=None, fmt='%Y-%m-%d %H:%M:%S'):
        """Format time"""
        if dt is None:
            dt = datetime.now()
        return dt.strftime(fmt)
    
    @staticmethod
    def add_days(dt=None, days=0):
        """Add/subtract days"""
        if dt is None:
            dt = datetime.now()
        return dt + timedelta(days=days)
    
    @staticmethod
    def add_weeks(dt=None, weeks=0):
        """Add/subtract weeks"""
        return TimeTool.add_days(dt, weeks * 7)
    
    @staticmethod
    def add_months(dt=None, months=0):
        """Add/subtract months"""
        if dt is None:
            dt = datetime.now()
        
        month = dt.month - 1 + months
        year = dt.year + month // 12
        month = month % 12 + 1
        day = min(dt.day, calendar.monthrange(year, month)[1])
        
        return datetime(year, month, day, dt.hour, dt.minute, dt.second)
    
    @staticmethod
    def timestamp(dt=None):
        """Get Unix timestamp"""
        if dt is None:
            dt = datetime.now()
        return int(dt.timestamp())
    
    @staticmethod
    def from_timestamp(ts):
        """Create datetime from timestamp"""
        return datetime.fromtimestamp(ts)
    
    @staticmethod
    def is_leap_year(year):
        """Check if leap year"""
        return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
    
    @staticmethod
    def weekday(dt=None):
        """Get weekday (0=Monday, 6=Sunday)"""
        if dt is None:
            dt = datetime.now()
        return dt.weekday()
    
    @staticmethod
    def weekday_name(dt=None, lang='zh'):
        """Get weekday name"""
        if dt is None:
            dt = datetime.now()
        
        weekdays_zh = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        weekdays_en = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        weekdays = weekdays_zh if lang == 'zh' else weekdays_en
        return weekdays[dt.weekday()]
    
    @staticmethod
    def friendly_time(dt=None):
        """Friendly time display"""
        if dt is None:
            dt = datetime.now()
        
        now = datetime.now()
        diff = now - dt
        seconds = diff.total_seconds()
        
        if seconds < 0:
            return "Future"
        elif seconds < 60:
            return "Just now"
        elif seconds < 3600:
            minutes = int(seconds / 60)
            return f"{minutes} min ago"
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f"{hours} hours ago"
        elif seconds < 604800:
            days = int(seconds / 86400)
            return f"{days} days ago"
        else:
            return dt.strftime('%Y-%m-%d')
    
    @staticmethod
    def days_between(dt1, dt2):
        """Days between two dates"""
        return abs((dt2 - dt1).days)


def test_time_tool():
    """Test time tool"""
    print("=" * 50)
    print("Project: Time Tool v1.0 - Test Suite")
    print("=" * 50)
    
    tool = TimeTool()
    all_passed = True
    
    # 1. Test current time
    now = tool.now()
    print(f"1. Current time: {tool.format_time(now)}")
    
    # 2. Test format
    fmt_test = tool.format_time(now, '%Y/%m/%d %H:%M')
    expected = now.strftime('%Y/%m/%d %H:%M')
    status = "PASS" if fmt_test == expected else "FAIL"
    if fmt_test != expected: all_passed = False
    print(f"2. Format time: {fmt_test} {status}")
    
    # 3. Test add days
    future = tool.add_days(now, 10)
    days_diff = (future - now).days
    status = "PASS" if days_diff == 10 else "FAIL"
    if days_diff != 10: all_passed = False
    print(f"3. Add 10 days: {days_diff} days {status}")
    
    # 4. Test add month
    next_month = tool.add_months(now, 1)
    status = "PASS" if next_month.month == (now.month % 12) + 1 else "FAIL"
    if next_month.month != (now.month % 12) + 1: all_passed = False
    print(f"4. Add 1 month: {next_month.strftime('%Y-%m-%d')} {status}")
    
    # 5. Test timestamp
    ts = tool.timestamp(now)
    back = tool.from_timestamp(ts)
    status = "PASS" if tool.format_time(back) == tool.format_time(now) else "FAIL"
    if tool.format_time(back) != tool.format_time(now): all_passed = False
    print(f"5. Timestamp: {ts} {status}")
    
    # 6. Test leap year
    leap_2024 = tool.is_leap_year(2024)
    leap_2023 = tool.is_leap_year(2023)
    status = "PASS" if leap_2024 == True and leap_2023 == False else "FAIL"
    if not (leap_2024 == True and leap_2023 == False): all_passed = False
    print(f"6. Leap year: 2024={leap_2024}, 2023={leap_2023} {status}")
    
    # 7. Test weekday
    wed = datetime(2026, 2, 25)
    wed_day = tool.weekday(wed)
    status = "PASS" if wed_day == 2 else "FAIL"
    if wed_day != 2: all_passed = False
    print(f"7. Weekday: 2026-02-25 is {tool.weekday_name(wed)} {status}")
    
    # 8. Test friendly time
    just_now = tool.friendly_time(datetime.now())
    status = "PASS" if just_now == "Just now" else "FAIL"
    if just_now != "Just now": all_passed = False
    print(f"8. Friendly time: {just_now} {status}")
    
    # 9. Test days between
    d1 = datetime(2026, 1, 1)
    d2 = datetime(2026, 1, 11)
    days = tool.days_between(d1, d2)
    status = "PASS" if days == 10 else "FAIL"
    if days != 10: all_passed = False
    print(f"9. Days between: {days} days {status}")
    
    # 10. Test add weeks
    two_weeks_later = tool.add_weeks(now, 2)
    days_14 = (two_weeks_later - now).days
    status = "PASS" if days_14 == 14 else "FAIL"
    if days_14 != 14: all_passed = False
    print(f"10. Add 2 weeks: {days_14} days {status}")
    
    print("=" * 50)
    if all_passed:
        print("All tests PASSED!")
    else:
        print("Some tests FAILED!")
    print("=" * 50)
    
    return all_passed


if __name__ == '__main__':
    test_time_tool()
