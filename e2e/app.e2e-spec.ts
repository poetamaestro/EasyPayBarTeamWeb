import { EasyPayBarPage } from './app.po';

describe('easy-pay-bar App', function() {
  let page: EasyPayBarPage;

  beforeEach(() => {
    page = new EasyPayBarPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
