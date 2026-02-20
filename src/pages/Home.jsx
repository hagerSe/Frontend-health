import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaPlus, FaFacebook, FaTelegram, FaInstagram, 
  FaPhoneAlt, FaEnvelope, FaSearch, FaSignInAlt,
  FaAmbulance, FaUserMd, FaBaby, FaChevronRight 
} from "react-icons/fa";

const DEPTS = {
  emergency: {
    title: "Emergency Care",
    icon: <FaAmbulance className="text-red-500 text-4xl group-hover:scale-110 transition-transform" />,
    description: "The Emergency Department provides 24/7 critical care for life-threatening conditions with rapid response teams. Our highly trained trauma surgeons and emergency physicians are always ready.",
    shortDesc: "24/7 Highly urgent medical care..."
  },
  opd: {
    title: "OPD Services",
    icon: <FaUserMd className="text-blue-500 text-4xl group-hover:scale-110 transition-transform" />,
    description: "The Outpatient Department (OPD) delivers comprehensive medical consultations, diagnostic tests, and follow-up services without requiring hospital admission.",
    shortDesc: "Consultations & diagnostic services..."
  },
  anc: {
    title: "Maternal & Child",
    icon: <FaBaby className="text-pink-500 text-4xl group-hover:scale-110 transition-transform" />,
    description: "The Antenatal Care (ANC) Department ensures health for both mother and child through regular monitoring, prenatal care, and postnatal support.",
    shortDesc: "Focused care for mothers and babies..."
  }
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDept, setActiveDept] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + " medical health dashboard")}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* --- TOP BAR --- */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 py-2.5 px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm font-medium text-gray-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-blue-500 text-xs" />
              <span>+251 98 493 5677</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-blue-500 text-xs" />
              <span>agerneshdareje@gmail.com</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex gap-4 border-r border-gray-200 pr-5">
              <FaFacebook className="hover:text-blue-600 cursor-pointer transition-colors" />
              <FaTelegram className="hover:text-sky-500 cursor-pointer transition-colors" />
              <FaInstagram className="hover:text-pink-500 cursor-pointer transition-colors" />
            </div>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Emergency Support</Link>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
              <FaPlus className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              National<span className="text-blue-600">Health</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <ul className="flex items-center gap-8 text-[15px] font-semibold text-gray-600">
              <li><Link to="/" className="text-blue-600 border-b-2 border-blue-600 pb-1">Home</Link></li>
              <li><Link to="/about" className="hover:text-blue-600 transition-colors pb-1">About</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors pb-1">Contact</Link></li>
            </ul>

            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search services..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent border focus:border-blue-400 focus:bg-white rounded-2xl text-sm w-48 lg:w-64 transition-all focus:outline-none focus:ring-4 focus:ring-blue-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </form>

            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
            >
              <FaSignInAlt className="text-xs" />
              Sign In
            </button>
          </div>

          {/* Mobile Menu Icon Placeholder */}
          <div className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
             <div className="w-6 h-0.5 bg-gray-600 relative after:absolute after:top-2 after:left-0 after:w-full after:h-0.5 after:bg-gray-600 before:absolute before:-top-2 before:left-0 before:w-full before:h-0.5 before:bg-gray-600"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {/* --- HERO SECTION --- */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-6 border border-blue-100 animate-fade-in">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Modern Healthcare Management
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6">
                Redefining The Future Of <span className="text-blue-600">Digital Health</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl">
                Ensuring every citizen receives timely, affordable, and quality healthcare through our integrated, state-of-the-art management system.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center gap-3"
                >
                  Get Started Now
                  <FaChevronRight className="text-xs" />
                </button>
                <Link 
                  to="/about"
                  className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all"
                >
                  How it Works
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-8">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(id => (
                    <div key={id} className={`w-12 h-12 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden`}>
                      <img src={`https://i.pravatar.cc/100?img=${id+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    +2k
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500">
                  Trusted by <span className="text-gray-900 font-bold">2,000+</span> healthcare providers
                </p>
              </div>
            </div>

            {/* Right Visuals */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full aspect-square md:w-[500px] md:h-[500px] mx-auto">
                {/* Decorative background circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute top-[10%] right-[10%] w-32 h-32 bg-pink-100/50 rounded-full blur-2xl -z-10 animate-bounce" style={{animationDuration: '5s'}}></div>
                
                {/* Main Hero Image Frame */}
                <div className="relative w-full h-full rounded-[40px] md:rounded-[80px] overflow-hidden border-8 border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 bg-slate-200">
                   <img 
                    src="/src/assets/2.jpg" 
                    alt="Medical Professional" 
                    className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=800";
                    }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-float">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                    <FaAmbulance className="text-green-600 text-2xl" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Emergency</p>
                    <p className="text-lg font-extrabold text-gray-900">Active Units</p>
                  </div>
                </div>

                <div className="absolute top-12 -right-10 bg-white p-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-float" style={{animationDelay: '1s'}}>
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <FaUserMd className="text-orange-600 text-2xl" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Doctors</p>
                    <p className="text-lg font-extrabold text-gray-900">Online</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* --- SERVICES SECTION --- */}
        <section className="py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">Our System Services</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mb-8"></div>
            <p className="text-lg text-gray-600 leading-relaxed">
              We provide essential health services through our specialized departments, 
              ensuring comprehensive care for every segment of our community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(DEPTS).map(([key, dept]) => (
              <div 
                key={key}
                onClick={() => setActiveDept(activeDept === key ? null : key)}
                className={`group cursor-pointer p-8 rounded-[32px] border-2 transition-all duration-500 overflow-hidden relative
                  ${activeDept === key 
                    ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-200' 
                    : 'bg-white border-transparent hover:border-blue-100 hover:shadow-xl'
                  }`}
              >
                {/* Background Decor */}
                <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all
                  ${activeDept === key ? 'bg-white' : 'bg-blue-400'}`}></div>

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors
                  ${activeDept === key ? 'bg-white/10' : 'bg-blue-50'}`}>
                  {dept.icon}
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 transition-colors
                  ${activeDept === key ? 'text-white' : 'text-gray-900'}`}>{dept.title}</h3>
                
                <p className={`text-[15px] leading-relaxed transition-colors
                  ${activeDept === key ? 'text-blue-50' : 'text-gray-500'}`}>
                  {dept.shortDesc}
                </p>

                <div className={`mt-8 flex items-center gap-2 font-bold text-sm transition-all
                  ${activeDept === key ? 'text-white translate-x-1' : 'text-blue-600 group-hover:translate-x-1'}`}>
                  {activeDept === key ? 'View Less' : 'Learn More'}
                  <FaChevronRight className="text-[10px]" />
                </div>
              </div>
            ))}
          </div>

          {/* Expanded Service Content */}
          <div className={`overflow-hidden transition-all duration-700 ${activeDept ? 'max-h-[500px] mt-12' : 'max-h-0'}`}>
            {activeDept && (
              <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-blue-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <button onClick={() => setActiveDept(null)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                     <span className="text-gray-400 font-bold">✕</span>
                   </button>
                </div>
                <div className="grid md:grid-cols-12 gap-12 items-center">
                  <div className="md:col-span-1 hidden md:block">
                     <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center">
                        {DEPTS[activeDept].icon}
                     </div>
                  </div>
                  <div className="md:col-span-7">
                    <h4 className="text-3xl font-bold text-gray-900 mb-4">{DEPTS[activeDept].title} Overview</h4>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {DEPTS[activeDept].description}
                    </p>
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <button className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-gray-200">
                      View Facilities
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="py-24 bg-gray-900 rounded-[64px] mb-24 relative overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute -top-1/2 -left-1/4 w-[80%] h-[150%] bg-blue-600 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-1/2 -right-1/4 w-[60%] h-[120%] bg-pink-600 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 grid md:grid-cols-4 gap-12 text-center px-12">
            {[
              { val: "24/7", label: "Care Access" },
              { val: "150+", label: "Hospitals Joined" },
              { val: "50k+", label: "Patient Records" },
              { val: "99%", label: "System Uptime" }
            ].map((stat, i) => (
              <div key={i} className="group">
                <p className="text-5xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform duration-500">{stat.val}</p>
                <p className="text-blue-300 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                  <FaPlus className="text-white text-xs" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  National<span className="text-blue-600">Health</span>
                </h1>
              </div>
              <p className="text-gray-500 max-w-sm mb-8">
                Building a digital bridge between healthcare providers and citizens to ensure quality medical care for everyone, everywhere.
              </p>
              <div className="flex gap-4">
                 {[FaFacebook, FaTelegram, FaInstagram].map((Icon, i) => (
                   <div key={i} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                     <Icon />
                   </div>
                 ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-sm">Quick Links</h5>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-blue-600 transition-colors">Our Vision</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Support</Link></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-blue-600 transition-colors">Staff Login</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-sm">Contact Info</h5>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li className="flex items-start gap-3">
                  <FaPhoneAlt className="text-blue-600 mt-1" />
                  <span>+251 98 493 5677</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaEnvelope className="text-blue-600 mt-1" />
                  <span>agerneshdareje@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400 font-medium">
            <p>© 2026 National Health Management System. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
