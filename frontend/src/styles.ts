import { css } from "lit";

export const cardStyles = css`
  :host {
    --bvg-ok: var(--success-color, #43a047);
    --bvg-warn: var(--warning-color, #ffa600);
    --bvg-error: var(--error-color, #db4437);
    --bvg-muted: var(--secondary-text-color, #727272);
    --bvg-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --bvg-row-hover: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.04);
    --bvg-chip-bg: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
    --bvg-walk: var(--light-blue-color, #03a9f4);
    display: block;
  }

  /* Tile-style symbols: MDI icon on a tinted circle, like HA tile cards */
  .sym {
    --sym-size: 24px;
    --sym-color: var(--bvg-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--sym-size);
    height: var(--sym-size);
    border-radius: 50%;
    background: color-mix(in srgb, var(--sym-color) 20%, transparent);
    color: var(--sym-color);
    flex: none;
    box-sizing: border-box;
  }
  .sym ha-icon {
    --mdc-icon-size: calc(var(--sym-size) * 0.66);
    display: inline-flex;
  }
  .sym.xs {
    --sym-size: 16px;
  }
  .sym.s {
    --sym-size: 20px;
  }
  .sym.l {
    --sym-size: 32px;
  }
  .tone-place {
    --sym-color: var(--primary-color, #03a9f4);
  }
  .tone-walk {
    --sym-color: var(--bvg-walk);
  }
  .tone-muted {
    --sym-color: var(--bvg-muted);
  }
  .tone-current {
    --sym-color: currentColor;
  }
  .tone-ok {
    --sym-color: var(--bvg-ok);
  }
  .tone-warn {
    --sym-color: var(--bvg-warn);
  }
  .tone-error {
    --sym-color: var(--bvg-error);
  }
  .tone-suburban {
    --sym-color: #008d4f;
  }
  .tone-subway {
    --sym-color: #0a3c85;
  }
  .dark .tone-subway {
    --sym-color: #5c8fd6;
  }
  .tone-tram {
    --sym-color: #be1414;
  }
  .tone-bus {
    --sym-color: #a5027d;
  }
  .dark .tone-bus {
    --sym-color: #d04aa9;
  }
  .tone-ferry {
    --sym-color: #0080ba;
  }
  .tone-regional,
  .tone-express {
    --sym-color: #e2001a;
  }
  .dark .tone-tram,
  .dark .tone-regional,
  .dark .tone-express {
    --sym-color: #f04a4a;
  }
  ha-card {
    overflow: hidden;
    padding-bottom: 4px;
  }
  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 16px 4px;
  }
  .title {
    font-size: var(--ha-font-size-xl, 20px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.3;
    color: var(--primary-text-color);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .clock {
    font-size: 28px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.5px;
    color: var(--primary-text-color);
  }
  section {
    padding: 8px 0 4px;
  }
  section + section {
    border-top: 1px solid var(--bvg-divider);
    margin-top: 4px;
  }
  .group-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 16px 6px;
    color: var(--bvg-muted);
    font-size: var(--ha-font-size-s, 13px);
    font-weight: 500;
    min-width: 0;
  }
  .group-head > ha-icon {
    --mdc-icon-size: 16px;
    flex: none;
  }
  .group-head .sym.l {
    margin-right: 4px;
  }
  .group-head .place {
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .group-head .spacer {
    flex: 1;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px 2px 2px;
    border-radius: 999px;
    background: var(--bvg-chip-bg);
    color: var(--bvg-muted);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    flex: none;
  }
  .chip.stale {
    background: color-mix(in srgb, var(--bvg-warn) 18%, transparent);
    color: var(--primary-text-color);
  }

  /* Journey rows */
  .journey {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    column-gap: 12px;
    padding: 8px 16px 8px 20px;
    cursor: pointer;
    outline: none;
    transition: background-color 120ms ease;
  }
  .journey:hover,
  .journey:focus-visible {
    background: var(--bvg-row-hover);
  }
  .journey::before {
    content: "";
    position: absolute;
    left: 8px;
    top: 9px;
    bottom: 9px;
    width: 4px;
    border-radius: 2px;
    background: var(--urgency-color, var(--bvg-ok));
  }
  .u-relaxed {
    --urgency-color: var(--bvg-ok);
  }
  .u-soon {
    --urgency-color: var(--bvg-warn);
  }
  .u-now {
    --urgency-color: var(--bvg-warn);
  }
  .u-missed,
  .u-cancelled {
    --urgency-color: var(--bvg-error);
  }
  .u-missed .times,
  .u-missed .chain {
    opacity: 0.55;
  }
  .times {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 52px;
    font-variant-numeric: tabular-nums;
  }
  .dep {
    font-size: 20px;
    font-weight: 500;
    line-height: 1.15;
    color: var(--primary-text-color);
  }
  .planned {
    font-size: 11px;
    color: var(--bvg-muted);
    text-decoration: line-through;
    line-height: 1.2;
  }
  .late {
    color: var(--bvg-warn);
  }
  .very-late {
    color: var(--bvg-error);
  }
  .cancelled-text {
    text-decoration: line-through;
    text-decoration-color: var(--bvg-error);
    text-decoration-thickness: 2px;
    color: var(--bvg-muted);
  }
  .main {
    min-width: 0;
  }
  .chain {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px 2px;
  }
  .chain > .sym {
    margin-right: 2px;
  }
  .sep {
    color: var(--bvg-muted);
    font-size: 14px;
    margin: 0 1px;
    line-height: 1;
  }
  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px 8px;
    margin-top: 3px;
    font-size: 12px;
    color: var(--bvg-muted);
    font-variant-numeric: tabular-nums;
  }
  .meta .arr {
    color: var(--primary-text-color);
  }
  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    text-align: right;
  }
  .countdown {
    display: flex;
    align-items: baseline;
    gap: 2px;
    font-size: 22px;
    font-weight: 500;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    white-space: nowrap;
  }
  .countdown .unit {
    font-size: 12px;
    font-weight: 400;
    color: var(--bvg-muted);
  }
  .leave {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    color: var(--urgency-color);
  }
  .u-relaxed .leave {
    color: var(--bvg-muted);
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    white-space: nowrap;
    color: var(--sym-color);
  }
  .status.tone-muted {
    font-weight: 500;
  }

  /* Line badges */
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    height: 20px;
    padding: 0 5px;
    box-sizing: border-box;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.1px;
    line-height: 1;
    border-radius: 3px;
    white-space: nowrap;
    flex: none;
  }
  .badge.pill {
    border-radius: 999px;
    padding: 0 7px;
  }
  .badge.square {
    border-radius: 2px;
  }
  .badge.cancelled {
    opacity: 0.55;
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }
  .badge.large {
    min-width: 40px;
    height: 24px;
    font-size: 13.5px;
  }

  /* Details */
  .details {
    padding: 2px 16px 10px 20px;
    border-bottom: 1px dashed var(--bvg-divider);
    margin-bottom: 4px;
  }
  .leg {
    display: grid;
    grid-template-columns: 52px 64px 1fr;
    column-gap: 10px;
    padding: 6px 0;
    font-size: 13px;
    align-items: start;
  }
  .leg + .leg {
    border-top: 1px solid var(--bvg-divider);
  }
  .leg .t {
    display: flex;
    flex-direction: column;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    line-height: 1.45;
  }
  .leg .t small {
    color: var(--bvg-muted);
    font-size: 11px;
  }
  .leg .route {
    min-width: 0;
    line-height: 1.45;
  }
  .leg .stop {
    color: var(--primary-text-color);
  }
  .leg .sub {
    color: var(--bvg-muted);
    font-size: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
    align-items: center;
  }
  .leg.walk {
    color: var(--bvg-muted);
    font-size: 12px;
    align-items: center;
  }
  .leg .line {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .leg.walk .sym {
    justify-self: start;
  }
  .platform-changed {
    color: var(--bvg-warn);
    font-weight: 600;
  }
  .occupancy {
    display: inline-flex;
    align-items: center;
  }
  .occupancy ha-icon {
    --mdc-icon-size: 15px;
  }
  .occupancy.high {
    color: var(--bvg-error);
  }
  .occupancy.medium {
    color: var(--bvg-warn);
  }
  .remark {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--primary-text-color);
  }
  .remark .sym {
    margin-top: -1px;
  }

  /* Departure board */
  .departure {
    display: grid;
    grid-template-columns: 24px 44px 1fr auto auto;
    align-items: center;
    column-gap: 10px;
    padding: 5px 16px;
    min-height: 32px;
  }
  .departure .dir {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .departure .dir span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--primary-text-color);
    font-size: 14px;
  }
  .departure .dir small {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: var(--bvg-muted);
  }
  .planned-inline {
    text-decoration: line-through;
  }
  .departure .delay {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: right;
    min-width: 24px;
  }
  .departure .countdown {
    font-size: 17px;
    min-width: 44px;
    justify-content: flex-end;
  }
  .departure.unreachable {
    opacity: 0.45;
  }
  .departure.is-cancelled .dir span:first-child {
    text-decoration: line-through;
    text-decoration-color: var(--bvg-error);
    color: var(--bvg-muted);
  }
  .notices {
    margin: 4px 16px 4px;
    padding: 6px 10px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--bvg-warn) 10%, transparent);
    cursor: pointer;
  }
  .notices .summary {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .notices .summary > ha-icon {
    --mdc-icon-size: 16px;
    color: var(--bvg-muted);
  }
  .notices .spacer {
    flex: 1;
  }
  .notices .summary .preview {
    font-weight: 400;
    color: var(--bvg-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .empty,
  .warning {
    padding: 8px 16px;
    color: var(--bvg-muted);
    font-size: 13px;
  }
  .warning {
    color: var(--bvg-error);
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    padding: 4px 16px 6px;
    font-size: 11px;
    color: var(--bvg-muted);
    font-variant-numeric: tabular-nums;
  }
  .footer .stale-text {
    color: var(--bvg-warn);
    font-weight: 500;
  }
  @media (max-width: 420px) {
    .leave .label-long {
      display: none;
    }
  }
`;
