import {
  ArrowUpRight,
  ShoppingBag,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "New Orders",
      value: "150",
      icon: ShoppingBag,
      bgColor: "bg-blue-500",
      iconBg: "bg-blue-600",
      link: "#",
    },
    {
      title: "Bounce Rate",
      value: "53%",
      icon: TrendingUp,
      bgColor: "bg-green-500",
      iconBg: "bg-green-600",
      link: "#",
    },
    {
      title: "User Registrations",
      value: "44",
      icon: Users,
      bgColor: "bg-yellow-500",
      iconBg: "bg-yellow-600",
      link: "#",
    },
    {
      title: "Unique Visitors",
      value: "65",
      icon: Eye,
      bgColor: "bg-red-500",
      iconBg: "bg-red-600",
      link: "#",
    },
  ];

  return (
    <div className="content-wrapper p-6 pb-16">
      {/* Content Header */}
      <div className="content-header mb-6">
        <div className="container-fluid">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="#" className="text-gray-700 hover:text-blue-600">
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Dashboard</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="content">
        <div className="container-fluid">
          {/* Small boxes (Stat box) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`small-box ${stat.bgColor} rounded-lg text-white relative overflow-hidden`}
                >
                  <div className="p-4">
                    <div className="inner">
                      <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                      <p className="text-sm opacity-90">{stat.title}</p>
                    </div>
                    <div
                      className={`icon absolute top-4 right-4 ${stat.iconBg} rounded-full p-3`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  <a
                    href={stat.link}
                    className="small-box-footer bg-black bg-opacity-20 px-4 py-2 flex items-center justify-between text-sm hover:bg-opacity-30 transition-all"
                  >
                    More info <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
