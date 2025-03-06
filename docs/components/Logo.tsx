import { ThemedImage } from "./ThemedImage";

export function Logo() {
  return (
    <a
      href="/"
      onClick={() => {
        throw new Error("test");
      }}>
      <ThemedImage
        height={32}
        width={170}
        src="/img/logos/banner.svg"
        darkImage={"/img/logos/banner.dark.svg"}
        alt="BlockNote"
      />
    </a>
  );
}
