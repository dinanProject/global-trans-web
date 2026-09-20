export interface EffectiveRequestStatusInput {
	status?: string | null;
	statusName?: string | null;
	startDate?: string | null;
	endDate?: string | null;
}

export const EFFECTIVE_STATUS_SCHEDULED = 'SCHEDULED';
export const EFFECTIVE_STATUS_STARTING_SOON = 'STARTING_SOON';
export const EFFECTIVE_STATUS_IN_OPERATION = 'IN_OPERATION';
export const EFFECTIVE_STATUS_ATTENTION = 'ATTENTION';

const SCHEDULE_DRIVEN_STATUSES = new Set([
	'APPROVED',
	'ASSIGNED',
	'IN_PROGRESS',
]);

const EFFECTIVE_STATUS_LABELS: Record<string, string> = {
	DRAFT: 'Draft',
	CLIENT_REVIEW: 'Client Review',
	GTSI_REVIEW: 'Global Trans Review',
	APPROVED: 'Approved',
	ASSIGNED: 'Scheduled',
	IN_PROGRESS: 'In Operation',
	PARTIALLY_COMPLETED: 'Partially Completed',
	COMPLETED: 'Completed',
	STOPPED: 'Stopped',
	CANCELLED: 'Cancelled',
	REJECTED: 'Rejected',
	SCHEDULED: 'Scheduled',
	STARTING_SOON: 'Starting Soon',
	IN_OPERATION: 'In Operation',
	ATTENTION: 'Attention',
};

export function getEffectiveRequestStatusCode(
	request: EffectiveRequestStatusInput,
	now = Date.now(),
	startingSoonDays = 3,
): string {
	const workflowStatus = String(request.status || '').toUpperCase();

	if (!SCHEDULE_DRIVEN_STATUSES.has(workflowStatus)) {
		return workflowStatus;
	}

	const start = new Date(request.startDate || '').getTime();
	const end = new Date(request.endDate || '').getTime();

	if (!Number.isFinite(start) || !Number.isFinite(end)) {
		return workflowStatus;
	}

	if (now < start) {
		const reminderWindowMs = startingSoonDays * 24 * 60 * 60 * 1000;
		return start - now <= reminderWindowMs
			? EFFECTIVE_STATUS_STARTING_SOON
			: EFFECTIVE_STATUS_SCHEDULED;
	}

	if (now <= end) {
		return EFFECTIVE_STATUS_IN_OPERATION;
	}

	return EFFECTIVE_STATUS_ATTENTION;
}

export function getEffectiveRequestStatusLabel(
	request: EffectiveRequestStatusInput,
	now = Date.now(),
	startingSoonDays = 3,
): string {
	const effectiveCode = getEffectiveRequestStatusCode(
		request,
		now,
		startingSoonDays,
	);

	if (
		effectiveCode === String(request.status || '').toUpperCase() &&
		request.statusName
	) {
		return request.statusName;
	}

	return EFFECTIVE_STATUS_LABELS[effectiveCode] || effectiveCode || '—';
}
