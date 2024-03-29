import notify from './Notifier';
import { eventNames } from '../utils/types';
import EmailNotifications from './EmailNotifications';
import InAppNotifications from './InAppNotifications';
import ActivityLogger from './ActivityLogger';
import APISyncHandlers from './APISyncHandlers';

notify.register(eventNames.Activation, EmailNotifications.sendActivationEmail);
notify.register(eventNames.WelcomeLineManager, EmailNotifications.sendWelcomeEmailToLineManagers);

notify.register(eventNames.CanUpdateBranch, EmailNotifications.sendCanUpdateBranchEmail);
notify.register(eventNames.RequestToUpdateBranch, EmailNotifications.sendBranchUpdatePermissionRequest);

notify.register(eventNames.ChangedLineManager, EmailNotifications.notifyLineManagerOfChange);

notify.register(eventNames.ForgotPassword, EmailNotifications.sendPasswordResetEmail);

notify.register(eventNames.NewClaim, EmailNotifications.notifyLineManagerOfNewClaim);
notify.register(eventNames.NewClaim, EmailNotifications.notifyStaffOfClaimSubmission);
notify.register(eventNames.NewClaim, ActivityLogger.logClaimActivity);

notify.register(eventNames.EditRequested, EmailNotifications.notifyStaffEditRequest);
notify.register(eventNames.EditRequested, InAppNotifications.notifyStaffEditRequest);

notify.register(eventNames.Updated, EmailNotifications.notifyLineManagerOfUpdatedClaim);
notify.register(eventNames.Updated, ActivityLogger.logClaimActivity);

notify.register(eventNames.lineManagerApproved, EmailNotifications.notifyStaffLineManagerApproved);
notify.register(eventNames.lineManagerApproved, InAppNotifications.notifyStaffLineManagerApproved);

notify.register(eventNames.lineManagerDeclined, EmailNotifications.notifyStaffLineManagerDeclined);
notify.register(eventNames.lineManagerDeclined, InAppNotifications.notifyStaffLineManagerDeclined);

notify.register(eventNames.Cancelled, EmailNotifications.notifyStaffCancelled);
notify.register(eventNames.Cancelled, ActivityLogger.logClaimActivity);

notify.register(eventNames.Reminder, EmailNotifications.remindStaffOfPendingClaim);

// Activity logger events
notify.register(eventNames.LogActivity, ActivityLogger.log);

notify.register(eventNames.UpdateOnAppraisal, APISyncHandlers.updateStaffSupervisorOnAppraisal);

export default notify;
