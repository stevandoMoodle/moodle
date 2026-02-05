import { render, screen } from '@testing-library/react';

function Button() {
  return <button>Click me</button>;
}

describe('Button', () => {
  it('renders button text', () => {
    render(<Button />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

describe('Functional', () => {
  it('adds numbers', () => {
    expect(1 + 2).toBe(3);
  });
});

describe('Mock', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('mocks external module', async() => {
    jest.mock("@moodle/mod_book/service");
    const { UserService } = await import("@moodle/mod_book/service");

    const mockGetName = jest.fn().mockReturnValue("mocked");
    (UserService as jest.Mock).mockImplementation(() => ({
      getName: mockGetName
    }));

    const service = new UserService();
    expect(service.getName()).toBe("mocked");
  });

  it('spies on external module', async() => {
    jest.unmock("@moodle/mod_book/service");

    const { UserService } = await import("@moodle/mod_book/service");
    const spy = jest.spyOn(UserService.prototype, "getName");

    const service = new UserService();
    const result = service.getName();

    expect(result).toBe("real");
    expect(spy).toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
