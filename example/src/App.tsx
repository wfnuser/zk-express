import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./config/wagmi";
import RepoBattle from "./components/RepoBattle";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
          <RepoBattle />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
