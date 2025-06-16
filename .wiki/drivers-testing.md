# Driver Domain Testing Guide

This document outlines real-world scenarios and regulatory cases used in automated tests.

## Onboarding
- Create driver with unique CDL and valid email
- Reject duplicate CDL numbers

## HOS Compliance
- Validate 11 hour driving limit
- Validate 14 hour on-duty limit
- Validate 70 hour/8 day cycle rule

## Performance Tracking
- Calculate on-time delivery rate from completed loads

## Credential Validation
- Require CDL number, state, class, and expiration
- Medical card must be current

These scenarios are referenced in unit, integration, and E2E tests for the driver domain.
