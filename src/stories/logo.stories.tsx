import '@/styles.css';
import Logo from 'react_islands/logo';
import { Meta, StoryObj } from 'storybook-react-rsbuild';

const Component = ({ theme }: { theme: 'light' | 'dark' }) => {
  return (
    <div
      className={`w-full ${theme === 'light' ? '' : 'bg-gray-800 text-white'} p-4`}
    >
      <Logo
        className={`size-10 ${theme === 'light' ? 'fill-blue-800' : 'fill-blue-200'}`}
      />
      Dershanı logosu
    </div>
  );
};

const meta = {
  title: 'Dershani Logo',
  component: Component,
} as Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: { theme: 'light' },
};

export const Dark: Story = {
  args: { theme: 'dark' },
};
