import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { uiText } from '../copy/uiText';
import { WaitlistForm } from './WaitlistForm';

const text = uiText.waitlist;

async function fillIn() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(text.nameLabel), 'Test Person');
  await user.type(screen.getByLabelText(text.emailLabel), 'test@example.com');
  await user.type(screen.getByLabelText(text.companyLabel), 'Example Coatings Ltd');
  await user.selectOptions(screen.getByLabelText(text.countryLabel), 'Austria');
  await user.click(screen.getByRole('button', { name: text.submit }));
}

describe('WaitlistForm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('says it is not set up and does not crash when there is no URL', () => {
    render(<WaitlistForm endpointUrl="" />);
    expect(screen.getByText(text.notSetUp)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: text.submit })).toBeDisabled();
  });

  it('lists missing fields instead of sending', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<WaitlistForm endpointUrl="https://example.com/waitlist" />);
    await userEvent.setup().click(screen.getByRole('button', { name: text.submit }));
    expect(screen.getByText(text.requiredField(text.nameLabel))).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts JSON and says thank you', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    render(<WaitlistForm endpointUrl="https://example.com/waitlist" />);
    await fillIn();
    expect(await screen.findByText(text.success)).toBeInTheDocument();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.com/waitlist');
    expect(JSON.parse(options.body)).toMatchObject({
      name: 'Test Person',
      email: 'test@example.com',
      country: 'Austria',
      wantsToTestPrototype: false,
    });
  });

  it('shows an error when sending fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<WaitlistForm endpointUrl="https://example.com/waitlist" />);
    await fillIn();
    expect(await screen.findByText(text.error)).toBeInTheDocument();
  });
});
