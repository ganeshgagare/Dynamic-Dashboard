package com.dashboard.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt hashed

    @Column(nullable = false)
    private String role; // Admin | Manager | Analyst | Viewer

    @Column(columnDefinition = "TEXT")
    private String preferences; // JSON string

    public User() {}

    public User(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public Long getId()             { return id; }
    public String getName()         { return name; }
    public void setName(String n)   { this.name = n; }
    public String getEmail()        { return email; }
    public void setEmail(String e)  { this.email = e; }
    public String getPassword()     { return password; }
    public void setPassword(String p){ this.password = p; }
    public String getRole()         { return role; }
    public void setRole(String r)   { this.role = r; }
    public String getPreferences()  { return preferences; }
    public void setPreferences(String pref) { this.preferences = pref; }
}
