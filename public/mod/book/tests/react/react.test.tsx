import { React } from "@moodle/core/react";
import { expect } from "chai";
import sinon from "sinon";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from '@moodle/mod_book/counter';
import { requestGetName } from '@moodle/mod_book/service';

/**
 * Reset sinon session.
 * 1. Removes all stubs
 * 2. Restores original implementations
 * 3. Prevents leaks between tests
 */
const reset = () => {
  // Executes sinon.restore.
  afterEach(() => sinon.restore());
}

/**
 * Executes react component test.
 */
describe("<Counter TSX/>", () => {
  reset();

  it("increments count on click", async () => {
    render(<Counter />);

    const button = screen.getByRole("button");
    expect(button.textContent).to.equal("Count: 0");

    await userEvent.click(button);
    expect(button.textContent).to.equal("Count: 1");
  });

  // Executes sinon.spy.
  it("can spy on console", () => {
    const spy = sinon.spy(console, "log");
    window.console.log("hello");
    expect(spy.calledOnce).to.equal(true);
  });
});

/**
 * Executes sinon on spy, stub and mock.
 */
describe("Sinon", () => {
  reset();

  const user = {
    save(name: string) {
      return `Saved ${name}`;
    }
  };

  // Executes sinon.spy.
  describe("Spy", function () {
    it("Spies on saved user", () => {
      const spy = sinon.spy(user, "save");
      user.save("Alice");

      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(spy, "Alice");
    });
  });

  // Executes sinon.stub.
  describe("Stub", function () {
    it("Stubs predefined data", async () => {
      const stub = sinon.stub().resolves({ name: "Alice" });
      const getName = requestGetName(stub);
      expect(await getName()).to.equal("Alice");
    });

    it("Stubs fetched data", async () => {
      const stub = sinon.stub();
      const getName = requestGetName(stub);
      expect(await getName()).to.equal("Alice");
    });
  });

  // Executes sinon.mock.
  describe("Mock", function () {
    it("Mocks saved user", async () => {
      const mock = sinon.mock(user);
      mock.expects("save")
        .once()
        .withArgs("Charlie")
        .returns("OK");

      user.save("Charlie");
      mock.verify();
    });
  });
});

/**
 * Executes functional test.
 */
describe("Function", function () {
  describe("#indexOf()", function () {
    it("Should return -1 when the value is not present", function () {
      expect([1, 2, 3].indexOf(4)).to.equal(-1);
    });
  });
});