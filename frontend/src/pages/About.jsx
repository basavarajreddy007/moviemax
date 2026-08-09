import AnimatedTitle from "../components/common/AnimatedTitle";

export default function About() {
  return (
    <div className="browse-page" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 className="browse-title" style={{ marginBottom: 24 }}>
        <AnimatedTitle text="About MOVIEMAX" />
      </h1>
      <div className="auth-card glass" style={{ padding: 40, lineHeight: 1.8 }}>
        <p style={{ color: "#B3B3B3", marginBottom: 20 }}>
          MOVIEMAX is a premium OTT streaming platform that brings you unlimited access to thousands of movies, TV shows, and web series from around the world.
        </p>
        <p style={{ color: "#B3B3B3", marginBottom: 20 }}>
          Founded with a mission to deliver cinematic excellence, MOVIEMAX offers high-quality streaming in HD, Full HD, and 4K resolution across all your devices. Our curated library spans every genre imaginable - from action-packed blockbusters to indie gems, from timeless classics to the latest releases.
        </p>
        <h3 style={{ color: "#FFFFFF", marginTop: 30, marginBottom: 12 }}>Our Mission</h3>
        <p style={{ color: "#B3B3B3", marginBottom: 20 }}>
          To provide an unparalleled entertainment experience with seamless streaming, personalized recommendations, and a user interface that puts content front and center.
        </p>
        <h3 style={{ color: "#FFFFFF", marginBottom: 12 }}>Why MOVIEMAX?</h3>
        <ul style={{ color: "#B3B3B3", paddingLeft: 20, listStyle: "disc" }}>
          <li style={{ marginBottom: 8 }}>Extensive library of movies, TV shows, and web series</li>
          <li style={{ marginBottom: 8 }}>Multiple quality options from SD to 4K</li>
          <li style={{ marginBottom: 8 }}>Ad-free streaming on premium plans</li>
          <li style={{ marginBottom: 8 }}>Watch on any device, anytime</li>
          <li style={{ marginBottom: 8 }}>Personalized recommendations</li>
          <li>New content added regularly</li>
        </ul>
      </div>
    </div>
  );
}
