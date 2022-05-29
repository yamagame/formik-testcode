import { render, screen, act } from "@testing-library/react";
import App from "App";
import enzyme from "enzyme";

const Adapter = require("enzyme-adapter-react-16");
enzyme.configure({ adapter: new Adapter() });

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/Hello React/i);
  expect(linkElement).toBeInTheDocument();
});

test("use enzyme", async () => {
  const wrapper = enzyme.mount(<App />);
  await act(async () => {
    wrapper.find("input").at(2).simulate("click");
    wrapper.find("select[name='fruit']").simulate("change", {
      target: { value: "apple", name: "apple" },
    });
    wrapper.find("input").at(2).simulate("click");
    wrapper.update();
  });
  expect(wrapper).toMatchInlineSnapshot(`ReactWrapper {}`);
});
