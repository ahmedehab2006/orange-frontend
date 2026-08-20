import { Search, User } from "lucide-react";

function Header({ title }) {
    return (
        <header className="header">
            <h1>{title}</h1>

            <div className="header-actions">
                <div className="header-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search..."
                    />
                </div>

                <button className="header-user">
                    <User size={19} />
                </button>
            </div>
        </header>
    );
}

export default Header;