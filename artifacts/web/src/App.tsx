import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import Home from "@/pages/Home";
import BusinessPage from "@/pages/BusinessPage";
import CartPage from "@/pages/CartPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderTrackingPage from "@/pages/OrderTrackingPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/business/:id" component={BusinessPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/order/:id" component={OrderTrackingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-screen bg-gray-50 font-sans antialiased">
            <AnnouncementBar />
            <Navbar />
            <Router />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
