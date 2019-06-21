import ClaimService from '../../services/ClaimService';
import StaffService from '../../services/StaffService';

class AdministrationHelpers {
  static convertStaffWorksheetToObjectsArray(worksheet) {
    const arrayOfStaff = [];

    worksheet.eachRow((row) => {
      // eslint-disable-next-line
      const [emptyCell, staffId, firstname, lastname, middlename, email, phone] = row.values;

      arrayOfStaff.push({
        staffId: staffId.toUpperCase(),
        firstname,
        lastname,
        middlename,
        email: email.toLowerCase(),
        phone
      });
    });

    return arrayOfStaff;
  }

  static convertBranchWorksheetToObjectsArray(worksheet) {
    const arrayOfBranches = [];

    worksheet.eachRow((row) => {
      // eslint-disable-next-line
      const [emptyCell, name, solId, address] = row.values;
      arrayOfBranches.push({ name, solId, address });
    });

    return arrayOfBranches;
  }

  static filterAdminClaimsQueryResult(queryResult) {
    return queryResult.map((result) => {
      const {
        weekday,
        weekend,
        atm,
        shift,
        amount,
        status,
        monthOfClaim,
        'Staff.staffId': staffId,
        'Staff.firstname': firstname,
        'Staff.lastname': lastname,
        'Staff.middlename': middlename,
        'Staff.branch.solId': solId,
        'Staff.branch.name': branch,
        'Staff.role.name': role
      } = result;
      return {
        weekday,
        weekend,
        atm,
        shift,
        amount,
        status,
        staffId,
        firstname,
        lastname,
        middlename,
        solId,
        branch,
        monthOfClaim,
        role
      };
    });
  }

  static async submittedClaimsForAdmin() {
    const claims = await ClaimService.fetchSubmittedClaims();
    return AdministrationHelpers.filterAdminClaimsQueryResult(claims);
  }

  static async exportableClaims() {
    const claims = await ClaimService.fetchClaimsInProcessingForExports('Processing');
    return AdministrationHelpers.filterAdminClaimsQueryResult(claims);
  }

  static getClaimStatistics(filteredClaims) {
    const claimStats = {
      total: filteredClaims.length, approved: 0, declined: 0, pending: 0
    };
    return filteredClaims.reduce(AdministrationHelpers.statAccumulator, claimStats);
  }

  static statAccumulator(acc, claim) {
    if (['Processing', 'Completed'].includes(claim.status)) acc.approved += 1;
    if (claim.status.includes('Awaiting')) acc.pending += 1;
    if (claim.status === 'Declined') acc.declined += 1;
    if (claim.status === 'Cancelled') acc.total -= 1;
    return acc;
  }

  static getChartStatistics() {
    return ClaimService.getChartStatistics();
  }

  static fetchStaff(attributes) {
    return StaffService.fetchStaff(attributes);
  }
}

export default AdministrationHelpers;
