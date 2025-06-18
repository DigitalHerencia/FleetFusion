import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/database/db';

interface ScheduleReportRequest {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  filters: any;
  metrics: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId, orgId: currentOrgId } = await auth();
    const { orgId } = await params;
    if (!userId || !currentOrgId || currentOrgId !== orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ScheduleReportRequest = await request.json();
    const { name, description, frequency, recipients, filters, metrics } = body;

    // Calculate next send date based on frequency
    const nextSendDate = calculateNextSendDate(frequency);

    // Create scheduled report (mock implementation)
    // In a real application, you would save this to a database
    const scheduledReport = {
      id: `report_${Date.now()}`,
      organizationId: orgId,
      userId,
      name,
      description,
      frequency,
      recipients,
      filters,
      metrics,
      nextSendDate,
      isActive: true,
      createdAt: new Date(),
    };

    // Here you would typically save to database and set up a cron job
    // For now, we'll just return success
    if (process.env.NODE_ENV === 'development') {
      console.log('Scheduled report created', { id: scheduledReport.id });
    }

    return NextResponse.json({
      success: true,
      reportId: scheduledReport.id,
      nextSendDate: scheduledReport.nextSendDate,
    });
  } catch (error) {
    console.error('Schedule report error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule report' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId, orgId: currentOrgId } = await auth();
    const { orgId } = await params;
    if (!userId || !currentOrgId || currentOrgId !== orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data for scheduled reports
    // In a real application, you would fetch from database
    const scheduledReports = [
      {
        id: 'report_1',
        name: 'Weekly Performance Report',
        description: 'Weekly analytics summary for management',
        frequency: 'weekly',
        recipients: ['manager@company.com'],
        nextSend: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'report_2',
        name: 'Monthly Financial Report',
        description: 'Monthly revenue and cost analysis',
        frequency: 'monthly',
        recipients: ['finance@company.com', 'ceo@company.com'],
        nextSend: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        lastSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ];

    return NextResponse.json({ reports: scheduledReports });
  } catch (error) {
    console.error('Get scheduled reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled reports' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId, orgId: currentOrgId } = await auth();
    const { orgId } = await params;
    if (!userId || !currentOrgId || currentOrgId !== orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Mock deletion
    // In a real application, you would delete from database and cancel cron job
    if (process.env.NODE_ENV === 'development') {
      console.log('Deleting scheduled report', { reportId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete scheduled report error:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled report' },
      { status: 500 }
    );
  }
}

function calculateNextSendDate(frequency: string): Date {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}
