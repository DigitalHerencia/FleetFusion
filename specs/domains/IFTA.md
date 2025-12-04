# Domain Spec: IFTA

## Scope
Trip and fuel logging, quarterly report generation.

## Entities
- `IftaReport` (year, quarter, status)
- `IftaTrip` (date, vehicle, jurisdiction miles)
- `IftaFuelPurchase` (date, gallons, amount, jurisdiction)

## Server Actions
- `create-trip.action.ts`: add trip with jurisdiction miles validation.
- `log-fuel.action.ts`: add fuel purchase, optional receipt URL.
- `generate-report.action.ts`: aggregate trips/fuel into quarterly report.

## Business Rules
- Total miles equals sum of jurisdiction miles.
- Reports unique per org/year/quarter.
- Fuel entries must align with trip date ranges.

## Fetchers
- `list-trips.ts`: by vehicle/date range.
- `list-fuel.ts`: by vehicle/date range.
- `get-report.ts`: report with aggregates.

## UI
- Trip log table; fuel log; report summary cards; export to PDF/Excel.
