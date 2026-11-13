import { redirect } from "next/navigation";

export default function LuckyDrawIndex() {
  redirect("/lucky-draw/winners");
}
