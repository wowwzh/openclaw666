# Project Practice: Camel Case Converter
# Function: Convert between different naming conventions

import re

def to_camel_case(snake_str):
    """snake_case -> camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def to_snake_case(camel_str):
    """camelCase/PascalCase -> snake_case"""
    # Insert underscore before uppercase letters
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def toPascalCase(snake_str):
    """snake_case -> PascalCase"""
    components = snake_str.split('_')
    return ''.join(x.title() for x in components)

def to_screaming_snake(snake_str):
    """snake_case -> SCREAMING_SNAKE_CASE"""
    return snake_str.upper()

def to_kebab_case(snake_str):
    """snake_case -> kebab-case"""
    return snake_str.replace('_', '-')

# Test cases
test_cases = [
    # snake_case -> camelCase
    ("hello_world", "camelCase", "helloWorld"),
    ("my_variable_name", "camelCase", "myVariableName"),
    ("api_endpoint_url", "camelCase", "apiEndpointUrl"),
    
    # snake_case -> PascalCase
    ("hello_world", "PascalCase", "HelloWorld"),
    ("user_id", "PascalCase", "UserId"),
    
    # camelCase -> snake_case
    ("helloWorld", "snake_case", "hello_world"),
    ("myVariableName", "snake_case", "my_variable_name"),
    ("getUserId", "snake_case", "get_user_id"),
    
    # PascalCase -> snake_case
    ("HelloWorld", "snake_case", "hello_world"),
    ("UserInfo", "snake_case", "user_info"),
    
    # snake_case -> SCREAMING_SNAKE
    ("hello_world", "SCREAMING_SNAKE", "HELLO_WORLD"),
    
    # snake_case -> kebab-case
    ("hello_world", "kebab-case", "hello-world"),
]

# Run tests
if __name__ == "__main__":
    print("=" * 60)
    print("Camel Case Converter - Tests")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for input_val, target_type, expected in test_cases:
        if target_type == "camelCase":
            result = to_camel_case(input_val)
        elif target_type == "PascalCase":
            result = toPascalCase(input_val)
        elif target_type == "snake_case":
            result = to_snake_case(input_val)
        elif target_type == "SCREAMING_SNAKE":
            result = to_screaming_snake(input_val)
        elif target_type == "kebab-case":
            result = to_kebab_case(input_val)
        
        if result == expected:
            status = "PASS"
            passed += 1
        else:
            status = "FAIL"
            failed += 1
        print(f"{status} {input_val} -> {target_type}: {result} (expected: {expected})")
    
    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)
