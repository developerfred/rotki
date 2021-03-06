import { ApiManualBalance } from '../../../src/services/types-api';
import { Guid } from '../../common/guid';
import { AccountBalancesPage } from '../pages/account-balances-page';
import { GeneralSettingsPage } from '../pages/general-settings-page';
import { RotkiApp } from '../pages/rotki-app';
import { TagManager } from '../pages/tag-manager';

describe('Accounts', () => {
  let username: string;
  let app: RotkiApp;
  let page: AccountBalancesPage;
  let tagManager: TagManager;
  let settings: GeneralSettingsPage;

  before(() => {
    username = Guid.newGuid().toString();
    app = new RotkiApp();
    page = new AccountBalancesPage();
    tagManager = new TagManager();
    settings = new GeneralSettingsPage();
    app.visit();
    app.createAccount(username);
    app.closePremiumOverlay();
    page.visit();
  });

  after(() => {
    app.logout();
  });

  describe('manual balances', () => {
    let manualBalances: ApiManualBalance[];
    before(() => {
      cy.fixture('manual-balances').then(balances => {
        manualBalances = balances;
      });
    });

    it('add first entry', () => {
      tagManager.addTag(
        '.manual-balances-form',
        'public',
        'Public Accounts',
        '#EF703C',
        '#FFFFF8'
      );
      page.addBalance(manualBalances[0]);
      page.visibleEntries(1);
      page.isVisible(0, manualBalances[0]);
    });

    it('change currency', () => {
      app.changeCurrency('EUR');
      page.showsCurrency('EUR');
    });

    it('add second entry', () => {
      page.addBalance(manualBalances[1]);
      page.visibleEntries(2);
      page.isVisible(1, manualBalances[1]);
    });

    it('test privacy mode is off', () => {
      page.amountDisplayIsNotBlurred();
    });

    it('test privacy mode is on', () => {
      app.togglePrivacyMode();
      page.amountDisplayIsBlurred();
      app.togglePrivacyMode();
    });

    it('test scramble mode', () => {
      page.balanceShouldMatch(manualBalances);

      settings.visit();
      settings.toggleScrambleData();
      page.visit();
      page.balanceShouldNotMatch(manualBalances);

      settings.visit();
      settings.toggleScrambleData();
      page.visit();
    });

    it('edit', () => {
      page.editBalance(1, '200');
      page.visibleEntries(2);
      page.isVisible(1, {
        ...manualBalances[1],
        amount: '200'
      });
    });

    it('delete', () => {
      page.deleteBalance(1);
      page.confirmDelete();
      page.visibleEntries(1);
      page.isVisible(0, manualBalances[0]);
    });
  });
});
