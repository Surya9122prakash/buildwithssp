async function main() {
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "client@acme.com", password: "password" })
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Data:", data);
}
main();
