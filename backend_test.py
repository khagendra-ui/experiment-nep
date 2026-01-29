#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class NepSafeAPITester:
    def __init__(self, base_url="https://git-repo-support.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        print(f"   Expected Status: {expected_status}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)

            print(f"   Actual Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True, f"Status: {response.status_code}")
                    return True, response_data
                except:
                    self.log_test(name, True, f"Status: {response.status_code} (No JSON response)")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Error: {error_data}")
                except:
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error - server may be down")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration endpoint"""
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        registration_data = {
            "name": "Test User",
            "email": test_email,
            "password": "TestPass123!",
            "role": "user"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=registration_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   ✓ Token received: {self.token[:20]}...")
            return test_email
        return None

    def test_user_login(self, email=None):
        """Test user login endpoint"""
        if not email:
            # Create a test user first
            email = self.test_user_registration()
            if not email:
                self.log_test("User Login (Setup Failed)", False, "Could not create test user")
                return False
        
        login_data = {
            "email": email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   ✓ Login successful, token: {self.token[:20]}...")
            return True
        return False

    def test_hotel_owner_registration(self):
        """Test hotel owner registration"""
        test_email = f"hotel_owner_{datetime.now().strftime('%H%M%S')}@example.com"
        registration_data = {
            "name": "Hotel Owner Test",
            "email": test_email,
            "password": "TestPass123!",
            "role": "hotel_owner"
        }
        
        success, response = self.run_test(
            "Hotel Owner Registration",
            "POST",
            "api/auth/register",
            200,
            data=registration_data
        )
        
        return success and 'token' in response

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "api/auth/login",
            401,
            data=invalid_data
        )
        
        return success  # Success means we got the expected 401

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Get Current User (No Token)", False, "No authentication token available")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200
        )
        
        return success and 'email' in response

    def test_duplicate_registration(self):
        """Test registering with existing email"""
        # First register a user
        test_email = f"duplicate_test_{datetime.now().strftime('%H%M%S')}@example.com"
        registration_data = {
            "name": "First User",
            "email": test_email,
            "password": "TestPass123!",
            "role": "user"
        }
        
        # First registration should succeed
        success1, _ = self.run_test(
            "First Registration",
            "POST",
            "api/auth/register",
            200,
            data=registration_data
        )
        
        if not success1:
            self.log_test("Duplicate Registration Test (Setup Failed)", False, "First registration failed")
            return False
        
        # Second registration with same email should fail
        registration_data["name"] = "Second User"
        success2, _ = self.run_test(
            "Duplicate Registration (Should Fail)",
            "POST",
            "api/auth/register",
            400,
            data=registration_data
        )
        
        return success2  # Success means we got the expected 400

    def run_all_tests(self):
        """Run comprehensive authentication tests"""
        print("=" * 60)
        print("🚀 Starting NepSafe Authentication API Tests")
        print("=" * 60)
        
        # Test 1: User Registration
        test_email = self.test_user_registration()
        
        # Test 2: User Login
        if test_email:
            self.test_user_login(test_email)
        
        # Test 3: Hotel Owner Registration
        self.test_hotel_owner_registration()
        
        # Test 4: Invalid Login
        self.test_invalid_login()
        
        # Test 5: Get Current User
        self.test_get_current_user()
        
        # Test 6: Duplicate Registration
        self.test_duplicate_registration()
        
        # Print Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check details above.")
            return 1

def main():
    tester = NepSafeAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())