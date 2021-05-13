# ShellPiper - The Piping Editor

ShellPiper is an editor for writing long pipe one-liners in the shell.
Instead of tweaking a long pipe chain in the terminal, use ShellPiper to create and tweak it with ease (and caching!).

![shellpiper](/pictures/shellpiper1.png)

## Caching

ShellPiper saves the stdout of every command in the chain and lets you re-use this output later.
The cache bar is pretty smart, it will only let you use the cached output of a command if all the commands above it are the same as they were the last time the command was executed.
To enable caching, check the box at the top of the cache bar at the left.

## Installation

### Windows

1. Download the latest `.exe` version from the [releases page](https://github.com/TheYarin/ShellPiper/releases)

1. Running it will install ShellPiper on your machine.

1. You might get a "Windows protected your PC" pop up. I never told Microsoft I was making ShellPiper so it makes sense they won't recognize it. You can continue to the installation process by clicking on `More info` and then the `Run anyway` button will appear.

1. Now ShellPiper will automatically be installed on your machine, probably in the following path:  
   `C:\Users\<YOUR USERNAME>\AppData\Local\Programs\shell-piper`

### Linux

1. Download the latest `.AppImage` version from the [releases page](https://github.com/TheYarin/ShellPiper/releases)
1. `chmod +x` the downloaded `.AppImage` file to allow it's execution
1. That's it, now you can run this ShellPiper binary.

## Adding a shortcut to PATH

Usage is most fun when you can simply run `sp` in your terminal and ShellPiper starts running from your current directory. This is how you configure it:

### Windows

#### cmd.exe

Put [`sp.cmd`](/shortcuts/sp.cmd) in a directory that is in your Path and edit it so the path points to the installed exe.

#### Git Bash

Put [`sp`](/shortcuts/sp) in a directory that is in your Path and edit it so the path points to the installed exe.

### Linux

Put [`sp`](/shortcuts/sp) in a directory that is in your Path and edit it so the path points to the downloaded AppImage file.

## Mac Support

ShellPiper _should_ work on Mac using the `.dmg` version from the [releases page](https://github.com/TheYarin/ShellPiper/releases). But I never properly tested it on Mac, so... try it yourself and let me know 😁

## Known Issues

### No output is produced

Some programs buffer their output when they detect their output is piped. For now I only noticed this behavior on Git Bash's (Windows) implementations of `grep`, `find` etc. This will look like the command is producing no output, but the output will appear once the buffer is flushed, either when enough output is written or when the process exits.

Workaround is program dependant. For example, `grep` can take a `--line-buffered` argument that tells it to flush output on every line.
If this occurs on Linux, The `unbuffer` command (which comes as part of the `expect` package) might be able to do the trick for you.

### The ShellPiper UI is super laggy when a command outputs a ton of output

Yeah, sorry about that. Didn't get to fix this one yet. An easy workaround is simply to close the output window until the heavy command is finished. You can do this by double tapping the `Esc` key on your keyboard.

---

### Special Thanks

I want to thank [electron-react-boilerplate](https://electron-react-boilerplate.js.org/) for saving me a ton of drudgery and helping me focus on the fun parts.
