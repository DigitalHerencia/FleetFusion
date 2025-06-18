<!-- @format -->

## User Documentation

# FleetFusion User Documentation

Welcome to the FleetFusion user documentation. This collection of guides will help you get started
with FleetFusion and understand how to use its features effectively. The documentation is organized
into the following sections:

 -   **Quickstart:** Start here for a basic setup and usage walkthrough – see
    [Quickstart](.wiki/Getting-Started.md#quick-start).
-   **Role Guides:** Detailed guides for specific user roles:

    -   [Admin Guide](.wiki/ROLE_GUIDES/Admin.md)
    -   [Dispatcher Guide](.wiki/ROLE_GUIDES/Dispatcher.md)
    -   [Driver Guide](.wiki/ROLE_GUIDES/Driver.md)
    -   [Compliance Officer Guide](.wiki/ROLE_GUIDES/ComplianceOfficer.md)

-   **Module Guides:** Learn about each major module and feature:

    -   [Dispatch Management Guide](.wiki/MODULE_GUIDES/dispatch.md)
    -   [Vehicle Management Guide](.wiki/MODULE_GUIDES/vehicles.md)
    -   [Driver Management Guide](.wiki/MODULE_GUIDES/drivers.md)
    -   [Compliance Management Guide](.wiki/MODULE_GUIDES/compliance.md)
    -   [IFTA Reporting Guide](.wiki/MODULE_GUIDES/ifta.md)
    -   [Analytics Guide](.wiki/MODULE_GUIDES/analytics.md)
    -   [Settings Guide](.wiki/MODULE_GUIDES/settings.md)

-   **Additional Resources:**

    -   [FAQ](.wiki/FAQ.md) – Frequently Asked Questions about FleetFusion.
    -   [Troubleshooting](.wiki/TROUBLESHOOTING.md) – Solutions to common issues and errors.

# FleetFusion Quickstart Guide

This quickstart guide will walk you through setting up FleetFusion for the first time and performing
basic tasks to get your fleet management up and running.

1. **Sign Up and Onboard:** Visit the FleetFusion application URL and create an account. During
   sign-up, you'll provide your email and set a password. Once registered, you will be prompted to
   **onboard** your company:

    - Enter your company details (name, address, DOT/MC number if applicable, etc.).
    - The platform will create your organization space. As the first user, you will be assigned the
      **Admin** role for your company.

2. **Invite Team Members:** After onboarding, invite other users to join your organization:

    - Go to **Settings** > **Users & Roles** and click **Invite User**.
    - Send invitations to dispatchers, drivers, compliance officers, or other admins by entering
      their emails and assigning roles.
    - Invited users will receive an email with a link to join your company on FleetFusion.

3. **Add Vehicles:** Populate your fleet data by adding vehicles:

    - Navigate to the **Vehicles** module and click **Add Vehicle**.
    - Enter the vehicle details (make, model, year, VIN, license plate, etc.).
    - Save the vehicle. Repeat for all vehicles in your fleet.

4. **Add Drivers:** Add your drivers into the system:

    - Go to the **Drivers** module and click **Add Driver**.
    - Fill in the driver's information (name, contact details, license info, etc.).
    - Save the profile. The driver will now appear in the Drivers list.

5. **Create Your First Load (Dispatch):** With vehicles and drivers in place, you can schedule the
   first delivery:

    - Open the **Dispatch** module and click **New Load**.
    - Enter the shipment details (pickup location, drop-off location, cargo description, schedule
      times).
    - Assign a driver and a vehicle from the dropdown lists of those you added.
    - Save the load. It will now be visible on the dispatch board for tracking.

6. **Track and Manage Operations:**

    - As drivers pick up and deliver loads, they (or you, depending on workflow) should update the
      load status in the Dispatch module to reflect progress.
    - Navigate to the **Analytics** module to view any available dashboards and get an overview of
      operational metrics (once you have some data in the system).
    - Check the **Compliance** module to ensure all necessary documents for drivers and vehicles are
      uploaded (licenses, inspection reports, insurance, etc.). Upload any missing documents via
      **Compliance** > **Upload Document**.

7. **Explore Further:** Familiarize yourself with other modules and settings:

    - Visit the **IFTA Reporting** module if you need to track fuel usage and mileage by
      state/province for tax purposes.
    - Check out **Settings** for additional configurations like company preferences or to manage
      roles and company profile information.
    - Refer to the [Admin Guide](.wiki/ROLE_GUIDES/Admin.md) and other role-specific guides for
      specialized tasks and best practices as you start using FleetFusion.

Now you have the basics covered. Your FleetFusion environment is set up with core data, and you're
ready to manage your fleet operations. For more detailed instructions on specific features, refer to
the module guides and role guides listed in the documentation.

# Frequently Asked Questions (FAQ)

Below are answers to some common questions about using FleetFusion:

### How do I upload a compliance document?

1. Go to the **Compliance** module from the dashboard.
2. Click **Upload Document**.
3. Select the document type (e.g., driver license, insurance, inspection) and fill in the required
   details.
4. Attach your file and submit.

**Tip:** You can view the status of uploaded documents (Active, Expiring Soon, Expired) in the
Compliance dashboard.

---

### How do I reset my password?

1. On the sign-in page, click **Forgot Password?**.
2. Enter your registered email address.
3. Check your email and follow the instructions to set a new password.

---

### How do I invite new users?

1. Go to **Settings** > **Users & Roles** in the dashboard.
2. Click **Invite User**.
3. Enter the user's email and assign a role.
4. Send the invitation. The user will receive an email with a link to join your company on
   FleetFusion.

---

### What do the document status labels mean?

-   **Active:** The document is valid and up to date.
-   **Expiring Soon:** The document will expire in the near future (e.g., within 30 days). It should
    be renewed soon.
-   **Expired:** The document has passed its expiration date and is no longer valid. A new, valid
    document must be uploaded to remain compliant.

# Troubleshooting Guide

This guide addresses some common issues and their resolutions in FleetFusion.

### Cannot upload a document?

-   **Check file requirements:** Ensure the file type is allowed (e.g., PDF, JPG) and that the file
    size does not exceed the system limit.
-   **Complete all fields:** Verify that all required information (document type, expiration date,
    etc.) is provided in the upload form.
-   **Contact support:** If the issue persists after checking the above, there may be a system issue.
    Reach out to your system administrator or FleetFusion support for assistance.

---

### Not receiving email invitations or password reset emails?

-   **Inspect spam/junk folder:** The email might have been filtered by your email provider. Check
    your spam or junk folder for the invitation or reset email.
-   **Verify the email address:** Confirm that the email was entered correctly (typos in the address
    can cause delivery failures).
-   **Resend or contact support:** If the email is still not found, try resending the invitation or
    password reset. If it still does not arrive, contact support as there may be an email delivery
    issue.

# Admin Guide

## Overview

Administrators (Admins) have full access to FleetFusion and oversee the entire fleet management
system for their company. An Admin is typically responsible for initial system setup, managing users
and roles, and configuring company-wide settings.

## Key Responsibilities

-   **User Management:** Invite new users, assign roles (Dispatcher, Driver, Compliance Officer), and
    remove or update users as needed.
-   **Company Settings:** Update company profile information and preferences (such as company details,
    branding, or default settings).
-   **Access & Permissions:** Ensure each team member has appropriate access; only Admins can grant
    roles or change other users’ roles.
-   **Oversight:** View system audit logs and activities to monitor usage and security. Admins may
    also handle high-level tasks like managing billing or subscriptions if applicable.

## Guide

**Inviting a New User:**

1. Navigate to **Settings** > **Users & Roles** in the FleetFusion dashboard.
2. Click **Invite User**.
3. Enter the user's email address and select the appropriate role (e.g., Dispatcher, Driver,
   Compliance Officer).
4. Send the invitation. The invited user will receive an email with instructions to join your
   organization.

**Managing Company Information:**

1. Go to **Settings** > **Company Profile** (or **Company Settings**).
2. Update any necessary fields such as company name, address, contact information, or preferences
   (e.g., time zone, unit settings).
3. Click **Save** to apply changes. These settings apply to all users in your organization.

**Reviewing Audit Logs (if available):**

-   If FleetFusion provides an **Audit Logs** or **Activity** section (usually under **Settings** or
    an Admin dashboard), navigate there to review recent actions in the system (e.g., user logins,
    data changes).
-   Use audit logs to troubleshoot or ensure compliance with internal policies by seeing who did what
    and when.

**Billing Management:**

-   If your organization’s plan or billing info is managed through FleetFusion, an Admin can access
    the **Billing** section (often under **Settings**).
-   Review subscription details, update payment information, or download invoices as needed. _(If
    billing is not handled in-app, this section may direct you to a separate billing portal or require
    contacting FleetFusion support.)_

## Tips

-   Only assign the **Admin** role to trusted users who require full access. Admins can make
    system-wide changes.
-   Regularly review the list of users and their roles in **Settings** to ensure permissions are
    up-to-date with any staffing changes.
-   Use the [Settings Guide](../MODULE_GUIDES/settings.md) for detailed information on configuration
    options and managing users and roles.

# Dispatcher Guide

## Overview

Dispatchers coordinate and schedule the fleet’s operations. In FleetFusion, a dispatcher primarily
uses the Dispatch module to create and manage loads, assign drivers and vehicles, and monitor
delivery statuses in real-time.

## Key Responsibilities

-   **Load Planning:** Create new loads/orders that need to be transported.
-   **Driver & Vehicle Assignment:** Assign available drivers and appropriate vehicles to each load.
-   **Schedule Management:** Set pickup and delivery times and adjust schedules as necessary.
-   **Status Monitoring:** Track the progress of active loads and update statuses or reassign
    resources if issues arise.
-   **Communication:** Relay information to drivers regarding their assignments (via internal notes or
    external communication, as needed).

## Guide

**Creating and Assigning a Load:**

1. Navigate to the **Dispatch** module from the dashboard.
2. Click **New Load** to create a load.
3. Enter load details such as origin, destination, cargo description, and pickup/delivery times.
4. Assign a driver and a vehicle to the load from the available dropdown lists of drivers and
   vehicles.
5. Save the load. It will now appear on the dispatch board or list with its initial status (e.g.,
   "Scheduled" or "Pending").

**Managing Active Loads:**

-   Monitor the Dispatch dashboard for status updates (e.g., when a driver marks a load as picked up
    or delivered).
-   If a driver is unable to complete a load or if schedule changes occur, use the dispatch interface
    to edit the load:

    -   Update the load’s details or timing.
    -   Reassign the load to a different driver or vehicle if necessary (Tip: in some views you can drag
        and drop a load to a new assignment or use an **Edit** dialog to change the driver/vehicle).

**Adjusting Schedules:**

-   For any delays or early completions, update the load's record:

    -   Change the delivery or pickup times as needed.
    -   Add notes to the load (if the system allows) to inform others of changes or special
        instructions.

-   Ensure that drivers are informed of any schedule changes (the system might send notifications, but
    a direct call or message can be used for urgent changes).

## Tips

-   Use filtering options in the Dispatch module to quickly find loads by status, driver, date, or
    destination, especially as the number of loads grows.
-   Pay attention to color-coding or status labels on the dispatch board (for example, overdue loads
    might be highlighted).
-   Refer to the [Dispatch Management Guide](../MODULE_GUIDES/dispatch.md) for detailed instructions
    on using the dispatch interface and features.

# Driver Guide

## Overview

Drivers use FleetFusion to stay informed about their assignments and to record important information
during their trips. A Driver user can see their dispatches, update load statuses, and manage their
own compliance tasks like hours-of-service logs or document uploads.

## Key Responsibilities

-   **View Assignments:** Check upcoming and current loads assigned to them, including details like
    addresses, schedules, and instructions.
-   **Status Updates:** Mark loads as in-progress (e.g., picked up) or completed (delivered) as they
    carry out deliveries.
-   **Document Uploads:** Upload necessary documents such as Proof of Delivery (POD) receipts, fuel
    receipts, or inspection reports related to their trips.
-   **Hours of Service (HOS) Logging:** Record driving hours and breaks if the platform supports HOS
    tracking, to comply with regulations.

## Guide

**Viewing and Managing Loads:**

1. Log in to FleetFusion. The dashboard will display your current and upcoming assignments (loads).
2. Click on a load to view its details, including origin/destination, scheduled times, and any notes
   or special instructions.
3. Update the load status as you progress:

    - When you depart for pickup, mark the load as **In Transit** or similar.
    - Upon delivery, mark the load as **Delivered** or **Completed**.
    - These updates inform dispatchers and the system of real-time progress.

**Uploading Documents (e.g., Proof of Delivery):**

1. After completing a load (or as required), you may need to upload a document. In the load details
   page, look for an option to **Upload Document** (or specifically **Upload POD**).
2. Select the file from your device (for example, a signed delivery receipt or a photo of the
   delivered goods).
3. Choose the document type if prompted (e.g., "Proof of Delivery") and add any notes required.
4. Submit the upload. The document will be attached to the load record for dispatchers and
   compliance officers to review.

**Logging Hours (if applicable):**

-   If FleetFusion provides an HOS logging feature, access it via the **Compliance** or **Logs**
    section in your dashboard.
-   Record your duty status changes (e.g., Driving, On Duty, Off Duty) with start and stop times as
    required by HOS rules.
-   Always keep these logs up to date. If the system is connected to an ELD device, some logs might
    auto-populate, but you may need to certify or adjust them.

## Tips

-   Keep your assigned load information up to date. Timely status updates help dispatchers respond
    quickly to any delays or issues.
-   If using a mobile device, take advantage of FleetFusion’s mobile-friendly interface (if available)
    to update statuses and upload documents on the go.
-   If you encounter any issues with your assignment details or the app (e.g., you can’t update a
    status), contact your dispatcher or Admin for assistance.

# Compliance Officer Guide

## Overview

Compliance officers focus on ensuring that all fleet operations meet regulatory requirements. In
FleetFusion, a Compliance Officer uses the platform to track and manage all compliance-related
documents and records, keeping the company ready for inspections or audits at any time.

## Key Responsibilities

-   **Document Management:** Ensure that all required documents (driver licenses, medical
    certificates, vehicle inspection reports, insurance policies, etc.) are stored in the system and
    kept up to date.
-   **Monitoring Expirations:** Regularly review document statuses and receive alerts for any that are
    expiring soon or have expired.
-   **Regulatory Reporting:** Prepare for audits by retrieving necessary records and, if available,
    generate compliance reports for authorities (e.g., a list of expired items, IFTA reports).
-   **Policy Enforcement:** Oversee that drivers and other staff are following safety and compliance
    protocols (for example, drivers logging hours properly or vehicles undergoing scheduled
    inspections).

## Guide

**Uploading and Updating Compliance Documents:**

1. Go to the **Compliance** module on the dashboard. You will see an overview list of compliance
   documents and their status (Active, Expiring Soon, Expired).
2. To add a new document (for example, a renewed driver's license or updated insurance card), click
   **Upload Document**.
3. Choose the document type from the list (such as _Driver’s License_, _Insurance_, _Inspection
   Report_, etc.).
4. Enter the required details (e.g., expiration date, associated driver or vehicle) and attach the
   document file.
5. Submit to save. The document will now appear in the list, and its status will be tracked
   automatically based on the expiration date you provided.

**Reviewing Compliance Status:**

-   On the main Compliance dashboard, check for any items marked **Expiring Soon** or **Expired**
    (these are usually highlighted or filtered to grab your attention).
-   Click on those items to view details and determine what action is needed:

    -   If a driver’s license is expiring, reach out to that driver to get an updated license and upload
        it.
    -   If a vehicle inspection is expired, schedule an inspection and update the record once completed.

-   You can use filters or search in the Compliance module to find specific documents by type (e.g.,
    show all insurance policies) or by personnel/vehicle.

**Preparing for Audits:**

-   If an audit or inspection is upcoming, use FleetFusion to retrieve all necessary documentation:

    -   Ensure all driver qualification files are present (licenses, medical cards).
    -   Ensure all vehicle records are in order (recent inspections, maintenance logs).
    -   Export or print documents if needed. (If FleetFusion offers a report or export feature, use it
        to generate a bundle of compliance documents or a report of compliance status).

-   Review the **Audit Log** (if provided in the system) to see a history of compliance-related
    actions (e.g., document uploads, edits) in case an auditor inquires about changes or updates.

## Tips

-   Schedule a periodic review (e.g., weekly or monthly) of the Compliance module to catch upcoming
    expirations well in advance.
-   Communicate with drivers and the fleet manager proactively when documents need renewal.
    FleetFusion’s **Expiring Soon** status is a helpful alert, but direct communication ensures
    everyone is aware.
-   Refer to the [Compliance Management Guide](../MODULE_GUIDES/compliance.md) for detailed features
    of the Compliance module and instructions on using its tools effectively.

# Dispatch Management Guide

## Overview

Manage loads, assignments, and real-time status tracking in the Dispatch module.

## Key Features

-   Create and assign loads
-   Track load status in real time

## How to Use

1. Go to the **Dispatch** module from the dashboard.
2. Click **New Load** to create a load.
3. Assign drivers and vehicles to the load.
4. Monitor status updates on the dispatch board as drivers update their progress.

## Tips

-   Use filters to quickly find specific loads by driver, date, or status.
-   Drag and drop loads (if supported) to reassign or reschedule them easily.

# Vehicle Management Guide

## Overview

Manage vehicle info, maintenance records, inspections, and assignments.

## Key Features

-   Add or edit vehicle profiles (with details like VIN, license plate, etc.)
-   Log maintenance and inspection events for each vehicle
-   Assign vehicles to drivers or loads and track availability

## How to Use

1. Go to the **Vehicles** module from the dashboard.
2. Click **Add Vehicle** to register a new vehicle.
3. Fill in the vehicle details (make, model, year, VIN, license plate, etc.) and save.
4. For existing vehicles, click on a vehicle in the list to view or edit its details. Update
   maintenance or inspection information as needed (there may be fields or sub-sections for adding a
   maintenance record or noting the last inspection date).

## Tips

-   Keep vehicle records up to date with the latest maintenance and inspection info to ensure
    compliance and optimal operation.
-   Before assigning a vehicle to a new load, check its status (e.g., not under maintenance) to avoid
    scheduling conflicts.

# Driver Management Guide

## Overview

Manage driver info, licensing, hours-of-service (HOS) logs, and document alerts in the Drivers
module.

## Key Features

-   Add and edit driver profiles (personal info, license details, etc.)
-   Track license and document status for each driver
-   Monitor HOS compliance and alerts for expiring certifications

## How to Use

1. Go to the **Drivers** module from the dashboard.
2. Click **Add Driver** to create a new driver profile.
3. Enter the driver's information (name, contact details, license number, expiration date, etc.) and
   save.
4. For existing drivers, click on a driver in the list to view or update their profile. You can
   upload important documents like a scanned license or certification in their profile if needed.

## Tips

-   Use the alerts or status indicators in the Drivers module to stay ahead of expiring licenses or
    certifications. FleetFusion may highlight drivers in need of updated documents.
-   Encourage drivers to keep their own information updated and to inform you of any changes (address,
    license renewal) so you can update the system accordingly.

# Compliance Management Guide

## Overview

Manage regulatory compliance documents and ensure all driver and vehicle records are up to date for
audits.

## Key Features

-   Upload and store compliance documents (licenses, permits, inspection reports, etc.)
-   Track document statuses and expiration dates with automatic alerts
-   View audit logs of compliance activities and generate compliance reports (if available)

## How to Use

1. Go to the **Compliance** module from the dashboard.
2. To upload a document, click **Upload Document**. Select the type of document (e.g., Driver
   License, Vehicle Inspection, Insurance), fill in required details (such as associated
   driver/vehicle and expiration date), attach the file, and submit.
3. The compliance dashboard will list all uploaded documents along with their status:

    - **Active:** Currently valid.
    - **Expiring Soon:** Close to expiring (highlighted to draw attention).
    - **Expired:** Past expiration and needs update.

4. Use filters or search within the Compliance module to find specific documents by type or by the
   person/vehicle they are associated with.
5. If needed, click on a document entry to view more details or to update it (for example, after
   renewing a document, you can update the record with the new expiration date and file).

## Tips

-   Regularly check the Compliance dashboard for any **Expiring Soon** items and address them before
    they expire (schedule renewals, inform drivers, etc.).
-   Keep digital copies of all critical documents in FleetFusion so that you can easily retrieve them
    during a compliance audit.
-   The Compliance module works hand-in-hand with the Drivers and Vehicles modules. Ensure that when
    adding a driver or vehicle, you also input their key compliance info (license expiration, last
    inspection date) so the system can start tracking those right away.

# IFTA Reporting Guide

## Overview

Automate mileage and fuel tracking for IFTA (International Fuel Tax Agreement) reporting.

## Key Features

-   Track miles driven and fuel purchased by jurisdiction
-   Generate IFTA reports for tax filing periods

## How to Use

1. Go to the **IFTA** module from the dashboard.
2. Enter trip data and fuel purchase information as required:

    - Record trips with distance traveled in each state/province.
    - Log fuel purchases with quantity and location (state/province).

3. After inputting data for the period, use the module’s report function to **Generate IFTA Report**
   (if available).
4. The system will compile the total miles and fuel by jurisdiction and produce a report that can be
   used for filing your quarterly IFTA return.

## Tips

-   Input trip and fuel data regularly (e.g., weekly) rather than waiting until the end of the
    quarter. This ensures the information is accurate and up-to-date.
-   Double-check the report against your fuel receipts and mileage logs for accuracy before filing.
-   Keep records of generated reports and underlying data in case of audits or discrepancies.

# Analytics Guide

## Overview

Use real-time dashboards for performance and financial metrics in the Analytics module.

## Key Features

-   View fleet utilization, on-time performance, fuel efficiency, and other operational charts
-   Filter data by date range, specific vehicle, or driver to drill down

## How to Use

1. Open the **Analytics** module from the dashboard.
2. By default, you’ll see a dashboard with key metrics (e.g., total loads delivered this month,
   average delivery time, fuel consumption, etc.).
3. Use filter controls (date pickers, drop-downs for vehicle or driver selection) to refine the
   data. For example, select a specific month or a particular driver to see their performance
   metrics.
4. Hover over charts for detailed values or click on segments (if interactive) to see more details.
5. If needed, export charts or reports using the provided option (such as a **Download** or
   **Export** button) for use in presentations or meetings.

## Tips

-   Regularly review the Analytics dashboard to identify trends (like improving or worsening delivery
    times or fuel costs) and make informed decisions.
-   Utilize the filters to compare performance – for example, how one driver’s on-time delivery rate
    compares to another’s, or fuel economy differences between vehicles.
-   If a particular metric is outside of expected ranges, investigate by looking at the underlying
    data (FleetFusion might allow you to click through to see the related records, or you may use the
    Dispatch/IFTA modules for deeper analysis).

# Settings Guide

## Overview

Manage company information, system preferences, and user roles in the Settings module.

## Key Features

-   Update company profile details (name, address, contact info)
-   Set preferences like time zone, units of measurement, or notification settings
-   Manage users and roles (invite users, assign roles, deactivate accounts)

## How to Use

1. Go to the **Settings** module from the dashboard. You will see sub-sections or tabs for different
   categories (Company Info, Users & Roles, Preferences, etc.).
2. **Company Info:** Review and edit your company’s details. Update fields such as company name,
   address, phone number, logo (if applicable), then save changes.
3. **Users & Roles:** Manage your team’s access:

    - View the list of all users in your organization and their roles.
    - To invite a new user, click **Invite User** and follow the steps (enter email, assign role).
    - To change a user’s role or deactivate a user, select the user from the list and use the edit
      options (role dropdown, active/inactive toggle).

4. **Preferences/Settings:** Adjust system-wide settings:

    - Set your time zone and regional settings so that dates/times and units (miles vs. kilometers,
      gallons vs. liters) are tailored to your region.
    - Configure notification preferences (for example, which email notifications or alerts are
      enabled for load assignments, document expirations, etc.).
    - If available, adjust branding settings like uploading a company logo or choosing a theme color
      for the interface.

## Tips

-   Only Admins can access and change Settings. If you are not an Admin and need a change, contact
    your Admin.
-   Keep the company profile updated, as this information might appear on reports or notifications
    (for instance, the company name and address on IFTA reports).
-   When inviting users, double-check the email address and role. New users will only have access to
    what their role permits, so assign roles carefully based on job function. (See the Admin Guide for
    more about roles and permissions.)
