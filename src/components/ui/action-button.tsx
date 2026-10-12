import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet" | "filter";
type ButtonSize = "default" | "small";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type LinkProps = SharedProps & {
  href: string;
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
};

type NativeButtonProps = SharedProps & {
  href?: undefined;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  "aria-pressed"?: boolean;
};

export type ActionButtonProps = LinkProps | NativeButtonProps;

export function ActionButton(props: ActionButtonProps) {
  const classes = `action-button action-button--${props.variant ?? "primary"} action-button--${props.size ?? "default"} ${props.className ?? ""}`.trim();

  if (props.href !== undefined) {
    return (
      <Link className={classes} href={props.href} onClick={props.onClick}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      aria-pressed={props["aria-pressed"]}
    >
      {props.children}
    </button>
  );
}
