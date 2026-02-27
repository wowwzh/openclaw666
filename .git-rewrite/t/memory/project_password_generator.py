import random
import string
import secrets

class PasswordGenerator:
    """Password Generator Tool v1.0"""
    
    def __init__(self):
        self.char_sets = {
            'lowercase': string.ascii_lowercase,
            'uppercase': string.ascii_uppercase,
            'digits': string.digits,
            'symbols': '!@#$%^&*()_+-=[]{}|;:,.<>?',
            'ambiguous': 'lI1O0'
        }
    
    def generate(self, length=16, 
                 use_lowercase=True, 
                 use_uppercase=True, 
                 use_digits=True, 
                 use_symbols=True,
                 exclude_ambiguous=False,
                 require_all_types=False):
        """
        Generate a secure password
        
        Args:
            length: Password length
            use_lowercase: Include lowercase letters
            use_uppercase: Include uppercase letters
            use_digits: Include digits
            use_symbols: Include special symbols
            exclude_ambiguous: Exclude ambiguous chars (l, I, 1, O, 0)
            require_all_types: Require at least from each type
            
 one char        Returns:
            Generated password string
        """
        # Build character pool
        pool = ''
        if use_lowercase:
            pool += self.char_sets['lowercase']
        if use_uppercase:
            pool += self.char_sets['uppercase']
        if use_digits:
            pool += self.char_sets['digits']
        if use_symbols:
            pool += self.char_sets['symbols']
        
        # Remove ambiguous characters if needed
        if exclude_ambiguous:
            pool = ''.join(c for c in pool if c not in self.char_sets['ambiguous'])
        
        if not pool:
            raise ValueError("At least one character type must be selected")
        
        # Generate password
        if require_all_types:
            password = []
            # Ensure at least one from each selected type
            if use_lowercase:
                chars = self.char_sets['lowercase']
                if exclude_ambiguous:
                    chars = ''.join(c for c in chars if c not in self.char_sets['ambiguous'])
                password.append(random.choice(chars))
            if use_uppercase:
                chars = self.char_sets['uppercase']
                if exclude_ambiguous:
                    chars = ''.join(c for c in chars if c not in self.char_sets['ambiguous'])
                password.append(random.choice(chars))
            if use_digits:
                chars = self.char_sets['digits']
                if exclude_ambiguous:
                    chars = ''.join(c for c in chars if c not in self.char_sets['ambiguous'])
                password.append(random.choice(chars))
            if use_symbols:
                password.append(random.choice(self.char_sets['symbols']))
            
            # Fill remaining length
            remaining = length - len(password)
            if remaining > 0:
                password.extend(secrets.choice(pool) for _ in range(remaining))
            
            # Shuffle
            random.shuffle(password)
            return ''.join(password)
        else:
            return ''.join(secrets.choice(pool) for _ in range(length))
    
    def generate_memorable(self, words=4, separator='-'):
        """
        Generate a memorable passphrase
        
        Args:
            words: Number of words
            separator: Separator between words
            
        Returns:
            Passphrase string
        """
        # Common readable words (shortened list for simplicity)
        word_list = [
            'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'galaxy',
            'harbor', 'island', 'jungle', 'knight', 'lemon', 'mountain', 'native',
            'ocean', 'planet', 'quantum', 'river', 'sunset', 'thunder', 'umbrella',
            'valley', 'winter', 'yellow', 'zebra', 'anchor', 'bridge', 'castle',
            'diamond', 'emerald', 'forest', 'golden', 'heaven', 'ivory', 'jasmine',
            'kingdom', 'lantern', 'marble', 'noble', 'opal', 'phoenix', 'quest',
            'rainbow', 'silver', 'tiger', 'universe', 'voyage', 'wisdom', 'xenon',
            'youth', 'zealot'
        ]
        
        selected = [secrets.choice(word_list) for _ in range(words)]
        
        # Optionally capitalize first letter
        selected = [word.capitalize() for word in selected]
        
        # Add a random number at the end
        selected.append(str(secrets.randbelow(100)))
        
        return separator.join(selected)
    
    def calculate_strength(self, password):
        """
        Calculate password strength score (0-100)
        
        Args:
            password: Password to evaluate
            
        Returns:
            Strength score and description
        """
        score = 0
        feedback = []
        
        # Length score
        if len(password) >= 8:
            score += 20
        if len(password) >= 12:
            score += 10
        if len(password) >= 16:
            score += 10
        
        # Character variety
        if any(c.islower() for c in password):
            score += 15
        if any(c.isupper() for c in password):
            score += 15
        if any(c.isdigit() for c in password):
            score += 15
        if any(c in self.char_sets['symbols'] for c in password):
            score += 15
        
        # Description
        if score >= 80:
            strength = "Very Strong"
        elif score >= 60:
            strength = "Strong"
        elif score >= 40:
            strength = "Medium"
        elif score >= 20:
            strength = "Weak"
        else:
            strength = "Very Weak"
        
        return score, strength


# Test Cases
def test_password_generator():
    gen = PasswordGenerator()
    
    # Test 1: Default password
    pwd = gen.generate()
    assert len(pwd) == 16, f"Test1 failed: length {len(pwd)}"
    print(f"Test1 passed! Generated: {pwd}")
    
    # Test 2: Custom length
    pwd = gen.generate(length=24)
    assert len(pwd) == 24, f"Test2 failed: length {len(pwd)}"
    print(f"Test2 passed! Generated: {pwd}")
    
    # Test 3: Only lowercase
    pwd = gen.generate(length=10, use_uppercase=False, use_digits=False, use_symbols=False)
    assert pwd.islower(), f"Test3 failed"
    print(f"Test3 passed! Generated: {pwd}")
    
    # Test 4: Exclude ambiguous
    pwd = gen.generate(length=20, exclude_ambiguous=True)
    assert all(c not in 'lI1O0' for c in pwd), f"Test4 failed"
    print(f"Test4 passed! Generated: {pwd}")
    
    # Test 5: Require all types
    pwd = gen.generate(length=16, require_all_types=True)
    has_lower = any(c.islower() for c in pwd)
    has_upper = any(c.isupper() for c in pwd)
    has_digit = any(c.isdigit() for c in pwd)
    has_symbol = any(c in gen.char_sets['symbols'] for c in pwd)
    assert has_lower and has_upper and has_digit and has_symbol, f"Test5 failed"
    print(f"Test5 passed! Generated: {pwd}")
    
    # Test 6: Memorable passphrase
    phrase = gen.generate_memorable(words=4)
    parts = phrase.split('-')
    assert len(parts) == 5, f"Test6 failed: {parts}"  # 4 words + 1 number
    print(f"Test6 passed! Generated: {phrase}")
    
    # Test 7: Strength calculation
    score, strength = gen.calculate_strength("abc123")
    assert strength in ["Weak", "Very Weak"], f"Test7 failed: {strength}"
    print(f"Test7 passed! Weak password: {score}/{strength}")
    
    score, strength = gen.calculate_strength("MyP@ssw0rd!2024")
    assert strength in ["Strong", "Very Strong"], f"Test7 failed: {strength}"
    print(f"Test7 passed! Strong password: {score}/{strength}")
    
    print("\nAll 7 tests passed!")


if __name__ == "__main__":
    test_password_generator()
