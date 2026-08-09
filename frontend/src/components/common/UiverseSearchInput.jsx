import { HiSearch } from "react-icons/hi";
import "../../css/UiverseSearch.css";

export default function UiverseSearchInput({ value, onChange, onSubmit, onFocus, placeholder = "Search movies, series..." }) {
  return (
    <div className="poda">
      <div className="glow" />
      <div className="darkBorderBg" />
      <div className="white" />
      <div className="border" />
      <div className="pink-mask" />
      <div className="main-input-wrapper">
        <HiSearch className="search-icon" />
        <form onSubmit={onSubmit}>
          <input
            type="text"
            className="uiverse-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            aria-label="Search"
          />
        </form>
      </div>
    </div>
  );
}
