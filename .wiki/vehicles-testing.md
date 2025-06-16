# Vehicle Testing Guide

This document outlines scenarios and test data for the Vehicle Management domain.

## Scenarios
- Create a vehicle with unique VIN
- Prevent duplicate VINs within an organization
- Update vehicle details and status
- Assign vehicles to drivers and create loads automatically
- Verify maintenance and compliance fields

## Edge Cases
- VIN must be exactly 17 characters and exclude I/O/Q
- Maintenance dates in the past should trigger warnings
- Insurance expiry earlier than registration should fail validation
